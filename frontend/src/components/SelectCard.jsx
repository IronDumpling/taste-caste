import { motion } from 'framer-motion';

/**
 * 可复用的选择卡片组件，适用于游戏、书籍、电影等类型。
 * 空状态可点击触发选择；已选状态展示标题与宣传图，可清除。
 *
 * @param {Object} props
 * @param {Object | null} props.item - 当前选中项，如 { id, name?, title?, cover?, image? }
 * @param {() => void} props.onSelect - 点击卡片（选择/更换）时触发
 * @param {() => void} [props.onClear] - 清除当前项时触发（已选时显示清除按钮）
 * @param {React.ReactNode} [props.emptyContent] - 空状态占位内容，默认显示加号
 * @param {string} [props.emptyLabel] - 空状态无障碍文案，用于 aria-label
 * @param {string} [props.titleLabel] - 无障碍标题，如「游戏」
 */
export default function SelectCard({ item, onSelect, onClear, emptyContent, emptyLabel = '点击选择', titleLabel }) {
  const title = item?.name ?? item?.title ?? '';
  const imageUrl = item?.cover ?? item?.image ?? null;

  const placeholder = emptyContent ?? (
    <span className="text-4xl text-zinc-500 font-light select-none" aria-hidden>+</span>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50 flex flex-col items-center justify-center overflow-hidden transition-colors text-left"
        aria-label={item ? `更换${titleLabel || '作品'}: ${title}` : (titleLabel ? `选择${titleLabel}` : emptyLabel)}
      >
        {item ? (
          <>
            <div className="w-full flex-1 min-h-0 relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-700" />
              )}
            </div>
            <p className="w-full p-2 text-sm font-medium text-zinc-100 truncate bg-zinc-900/90">
              {title}
            </p>
          </>
        ) : (
          placeholder
        )}
      </button>
      {item && onClear && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500/90 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          aria-label={`移除${title}`}
        >
          ×
        </button>
      )}
    </motion.div>
  );
}
