/**
 * spotNames.ts
 *
 * Spot表示名の管理を担当する。
 *
 * 役割:
 * 1. Spot数に応じて表示名を増減する。
 *
 * Reactや画面表示は知らない。
 */

/**
 * Spot数に合わせてSpot表示名一覧を増減する。
 *
 * Spot数が増えた場合は、
 * "Spot6" のようなデフォルト名を追加する。
 *
 * Spot数が減った場合は、
 * 余分なSpot名を削除する。
 *
 * @param spotNames 現在のSpot表示名一覧
 * @param spotCount 新しいSpot数
 *
 * @returns Spot数に合わせたSpot表示名一覧
 */
export function resizeSpotNames(
  spotNames: string[],
  spotCount: number,
): string[] {
  // 元の配列は変更しない
  const result = [...spotNames];

  // Spot数が増えた場合
  while (result.length < spotCount) {
    result.push(`Spot${result.length + 1}`);
  }

  // Spot数が減った場合
  return result.slice(0, spotCount);
}
