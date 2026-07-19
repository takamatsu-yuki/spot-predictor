/**
 * SpotSetting.tsx
 *
 * Spot表示名を編集するコンポーネント。
 *
 * このコンポーネントは表示と入力だけを担当する。
 * Spot名の状態管理はApp.tsxが行う。
 */

type Props = {
  /**
   * Spot表示名一覧
   */
  spotNames: string[];

  /**
   * Spot名変更通知
   *
   * @param index Spot番号(0始まり)
   * @param name 新しいSpot名
   */
  onSpotNameChange: (index: number, name: string) => void;
};

export default function SpotSetting({ spotNames, onSpotNameChange }: Props) {
  return (
    <div>
      <h2>Spot設定</h2>

      {spotNames.map((name, index) => (
        <div key={index}>
          <label>Spot{index + 1}</label>

          <input
            type="text"
            value={name}
            onChange={(e) => onSpotNameChange(index, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
