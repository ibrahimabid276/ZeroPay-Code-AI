import { prisma } from '@/lib/prisma';

export interface UpdateSettingsInput {
  theme?: string;
  language?: string;
  editorFontSize?: number;
  editorTabSize?: number;
  wordWrap?: boolean;
  aiModel?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

/**
 * Get user settings
 */
export async function getUserSettings(userId: string) {
  const preferences = await prisma.userPreference.findUnique({
    where: { userId },
  });

  return preferences;
}

/**
 * Update user settings
 */
export async function updateUserSettings(userId: string, input: UpdateSettingsInput) {
  const preferences = await prisma.userPreference.update({
    where: { userId },
    data: {
      ...(input.theme !== undefined && { theme: input.theme }),
      ...(input.language !== undefined && { language: input.language }),
      ...(input.editorFontSize !== undefined && { editorFontSize: input.editorFontSize }),
      ...(input.editorTabSize !== undefined && { editorTabSize: input.editorTabSize }),
      ...(input.wordWrap !== undefined && { wordWrap: input.wordWrap }),
      ...(input.aiModel !== undefined && { aiModel: input.aiModel }),
      ...(input.autoSave !== undefined && { autoSave: input.autoSave }),
      ...(input.autoSaveDelay !== undefined && { autoSaveDelay: input.autoSaveDelay }),
    },
  });

  return preferences;
}
