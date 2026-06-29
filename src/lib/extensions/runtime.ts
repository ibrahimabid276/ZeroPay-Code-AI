import { prisma } from '@/lib/prisma';
import { ExtensionInstance, ExtensionState, ActivationEvent, ExtensionPermission, ExtensionManifest } from '@/types/extension';
import { validateSecurityLevel, checkPermissionConflicts } from './permissions';

class ExtensionRuntimeManager {
  private extensions: Map<string, ExtensionInstance> = new Map();
  private activationListeners: Map<ActivationEvent, Set<string>> = new Map();

  /**
   * Install an extension
   */
  async installExtension(
    userId: string,
    manifest: ExtensionManifest,
    permissions: ExtensionPermission[] = []
  ): Promise<ExtensionInstance> {
    // Validate permissions
    const conflicts = checkPermissionConflicts(permissions);
    if (conflicts.length > 0) {
      throw new Error(`Permission conflicts: ${conflicts.join(', ')}`);
    }

    // Check security level
    const securityLevel = manifest.securityLevel || 'medium';
    if (!validateSecurityLevel(permissions, securityLevel)) {
      throw new Error('Permissions exceed security level restrictions');
    }

    // Create or update extension in database
    const extension = await prisma.extension.upsert({
      where: {
        userId_extensionId: {
          userId,
          extensionId: manifest.name,
        },
      },
      update: {
        version: manifest.version,
        manifest: manifest as any,
        requestedPermissions: permissions,
        state: 'inactive',
      },
      create: {
        userId,
        extensionId: manifest.name,
        name: manifest.name,
        displayName: manifest.displayName,
        description: manifest.description,
        version: manifest.version,
        publisher: manifest.publisher,
        category: manifest.categories[0] || 'other',
        manifest: manifest as any,
        requestedPermissions: permissions,
        grantedPermissions: [],
        state: 'inactive',
        securityLevel,
      },
    });

    // Create permission records
    for (const permission of permissions) {
      await prisma.extensionPermission.upsert({
        where: {
          extensionId_permission_userId: {
            extensionId: extension.id,
            permission,
            userId,
          },
        },
        update: {},
        create: {
          extensionId: extension.id,
          userId,
          permission,
          granted: false,
        },
      });
    }

    // Create in-memory instance
    const instance: ExtensionInstance = {
      id: extension.id,
      manifest,
      state: 'inactive',
      grantedPermissions: extension.grantedPermissions as ExtensionPermission[],
      contributedCommands: manifest.contributes?.commands || [],
      contributedViews: manifest.contributes?.views || [],
    };

    this.extensions.set(extension.id, instance);

    return instance;
  }

  /**
   * Uninstall an extension
   */
  async uninstallExtension(userId: string, extensionId: string): Promise<void> {
    const extension = await prisma.extension.findUnique({
      where: { id: extensionId },
    });

    if (!extension || extension.userId !== userId) {
      throw new Error('Extension not found');
    }

    // Deactivate if active
    if (extension.state === 'active') {
      await this.deactivateExtension(extensionId);
    }

    // Delete from database
    await prisma.extension.delete({
      where: { id: extensionId },
    });

    // Remove from memory
    this.extensions.delete(extensionId);
  }

  /**
   * Activate an extension
   */
  async activateExtension(extensionId: string): Promise<ExtensionInstance> {
    const instance = this.extensions.get(extensionId);
    if (!instance) {
      throw new Error('Extension not installed');
    }

    if (instance.state === 'active') {
      return instance;
    }

    // Update state
    instance.state = 'activating';
    this.extensions.set(extensionId, instance);

    try {
      // Update database
      await prisma.extension.update({
        where: { id: extensionId },
        data: {
          state: 'active',
          activatedAt: new Date(),
        },
      });

      instance.state = 'active';
      instance.activatedAt = Date.now();
      this.extensions.set(extensionId, instance);

      // Register activation events
      if (instance.manifest.activationEvents) {
        for (const event of instance.manifest.activationEvents) {
          if (!this.activationListeners.has(event)) {
            this.activationListeners.set(event, new Set());
          }
          this.activationListeners.get(event)!.add(extensionId);
        }
      }

      return instance;
    } catch (error) {
      instance.state = 'error';
      instance.error = error instanceof Error ? error.message : 'Activation failed';
      this.extensions.set(extensionId, instance);

      await prisma.extension.update({
        where: { id: extensionId },
        data: {
          state: 'error',
          error: instance.error,
        },
      });

      throw error;
    }
  }

  /**
   * Deactivate an extension
   */
  async deactivateExtension(extensionId: string): Promise<void> {
    const instance = this.extensions.get(extensionId);
    if (!instance) {
      throw new Error('Extension not found');
    }

    instance.state = 'inactive';
    instance.deactivatedAt = Date.now();
    this.extensions.set(extensionId, instance);

    await prisma.extension.update({
      where: { id: extensionId },
      data: {
        state: 'inactive',
        deactivatedAt: new Date(),
      },
    });

    // Remove from activation listeners
    for (const [, extensionIds] of this.activationListeners) {
      extensionIds.delete(extensionId);
    }
  }

  /**
   * Enable an extension
   */
  async enableExtension(extensionId: string): Promise<ExtensionInstance> {
    const instance = this.extensions.get(extensionId);
    if (!instance) {
      throw new Error('Extension not found');
    }

    await prisma.extension.update({
      where: { id: extensionId },
      data: { state: instance.state === 'disabled' ? 'inactive' : instance.state },
    });

    return instance;
  }

  /**
   * Disable an extension
   */
  async disableExtension(extensionId: string): Promise<ExtensionInstance> {
    const instance = this.extensions.get(extensionId);
    if (!instance) {
      throw new Error('Extension not found');
    }

    // Deactivate if active
    if (instance.state === 'active') {
      await this.deactivateExtension(extensionId);
    }

    instance.state = 'disabled';
    this.extensions.set(extensionId, instance);

    await prisma.extension.update({
      where: { id: extensionId },
      data: { state: 'disabled' },
    });

    return instance;
  }

  /**
   * Update an extension
   */
  async updateExtension(
    userId: string,
    extensionId: string,
    newManifest: ExtensionManifest
  ): Promise<ExtensionInstance> {
    const instance = this.extensions.get(extensionId);
    if (!instance) {
      throw new Error('Extension not found');
    }

    // Deactivate if active
    const wasActive = instance.state === 'active';
    if (wasActive) {
      await this.deactivateExtension(extensionId);
    }

    // Update manifest
    instance.manifest = newManifest;
    this.extensions.set(extensionId, instance);

    await prisma.extension.update({
      where: { id: extensionId },
      data: {
        manifest: newManifest as any,
        version: newManifest.version,
      },
    });

    // Reactivate if it was active
    if (wasActive) {
      await this.activateExtension(extensionId);
    }

    return instance;
  }

  /**
   * Grant permissions to an extension
   */
  async grantPermissions(
    extensionId: string,
    permissions: ExtensionPermission[]
  ): Promise<void> {
    const instance = this.extensions.get(extensionId);
    if (!instance) {
      throw new Error('Extension not found');
    }

    // Update database
    for (const permission of permissions) {
      await prisma.extensionPermission.updateMany({
        where: {
          extensionId,
          permission,
        },
        data: {
          granted: true,
          grantedAt: new Date(),
        },
      });
    }

    // Update instance
    const updatedExtension = await prisma.extension.findUnique({
      where: { id: extensionId },
    });

    if (updatedExtension) {
      instance.grantedPermissions = updatedExtension.grantedPermissions as ExtensionPermission[];
      this.extensions.set(extensionId, instance);
    }
  }

  /**
   * Get extension by ID
   */
  getExtension(extensionId: string): ExtensionInstance | undefined {
    return this.extensions.get(extensionId);
  }

  /**
   * Get all extensions for a user
   */
  async getUserExtensions(userId: string): Promise<ExtensionInstance[]> {
    const extensions = await prisma.extension.findMany({
      where: { userId },
      include: {
        permissionRecords: true,
      },
    });

    return extensions.map((ext: any) => {
      const instance = this.extensions.get(ext.id);
      if (instance) {
        return instance;
      }

      return {
        id: ext.id,
        manifest: ext.manifest as ExtensionManifest,
        state: ext.state as ExtensionState,
        grantedPermissions: ext.grantedPermissions as ExtensionPermission[],
        contributedCommands: (ext.manifest as any).contributes?.commands || [],
        contributedViews: (ext.manifest as any).contributes?.views || [],
        activatedAt: ext.activatedAt?.getTime(),
        deactivatedAt: ext.deactivatedAt?.getTime(),
        error: ext.error || undefined,
      };
    });
  }

  /**
   * Get extensions by activation event
   */
  getExtensionsByEvent(event: ActivationEvent): ExtensionInstance[] {
    const extensionIds = this.activationListeners.get(event);
    if (!extensionIds) {
      return [];
    }

    return Array.from(extensionIds)
      .map(id => this.extensions.get(id))
      .filter((ext): ext is ExtensionInstance => ext !== undefined);
  }

  /**
   * Get active extensions
   */
  getActiveExtensions(): ExtensionInstance[] {
    return Array.from(this.extensions.values()).filter(
      ext => ext.state === 'active'
    );
  }

  /**
   * Check if extension has permission
   */
  hasPermission(extensionId: string, permission: ExtensionPermission): boolean {
    const instance = this.extensions.get(extensionId);
    if (!instance) {
      return false;
    }

    return instance.grantedPermissions.includes(permission);
  }

  /**
   * Initialize all extensions for a user on startup
   */
  async initializeUserExtensions(userId: string): Promise<void> {
    const extensions = await prisma.extension.findMany({
      where: {
        userId,
        state: {
          in: ['active', 'inactive'],
        },
      },
    });

    for (const ext of extensions) {
      const instance: ExtensionInstance = {
        id: ext.id,
        manifest: ext.manifest as unknown as ExtensionManifest,
        state: ext.state as ExtensionState,
        grantedPermissions: ext.grantedPermissions as ExtensionPermission[],
        contributedCommands: (ext.manifest as any).contributes?.commands || [],
        contributedViews: (ext.manifest as any).contributes?.views || [],
        activatedAt: ext.activatedAt?.getTime(),
        deactivatedAt: ext.deactivatedAt?.getTime(),
        error: ext.error || undefined,
      };

      this.extensions.set(ext.id, instance);
    }
  }
}

// Singleton instance
export const extensionRuntime = new ExtensionRuntimeManager();
