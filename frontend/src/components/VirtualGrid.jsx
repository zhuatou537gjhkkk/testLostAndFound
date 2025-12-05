import { useState, useRef, useMemo, useEffect } from 'react';

/**
 * 通用虚拟滚动网格组件 (Virtual Grid)
 * @param {Array} items - 数据源
 * @param {Number} columnCount - 列数 (默认 2)
 * @param {Number} rowHeight - 固定行高 (像素)
 * @param {Function} renderItem - 渲染子项的函数 (item, index) => ReactNode
 * @param {Number} containerHeight - 容器高度 (用于计算视口内显示多少行)
 */
export default function VirtualGrid({
    items,
    columnCount = 2,
    rowHeight = 320, // 假设卡片高度大概 300px + 间距
    renderItem,
    containerHeight = 800 // 视口高度
}) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);

    // 1. 计算总行数
    const totalRows = Math.ceil(items.length / columnCount);

    // 2. 撑开容器的总高度 (这是让滚动条看起来正常的关键)
    const totalHeight = totalRows * rowHeight;

    // 3. 计算可视区域的起始行和结束行
    // 多渲染 2 行作为缓冲区 (Buffer)，防止滚动过快出现白屏
    const visibleRowsCount = Math.ceil(containerHeight / rowHeight) + 2;
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(totalRows, startRow + visibleRowsCount);

    // 4. 生成当前需要渲染的元素
    const visibleItems = useMemo(() => {
        const renderedNodes = [];

        for (let row = startRow; row < endRow; row++) {
            const rowItems = [];
            for (let col = 0; col < columnCount; col++) {
                const dataIndex = row * columnCount + col;
                if (dataIndex < items.length) {
                    rowItems.push(
                        <div key={dataIndex} className="flex-1 px-2">
                            {renderItem(items[dataIndex], dataIndex)}
                        </div>
                    );
                } else {
                    // 如果最后一行不满，用空 div 占位保持布局
                    rowItems.push(<div key={`empty-${col}`} className="flex-1 px-2"></div>);
                }
            }

            // 绝对定位每一行
            renderedNodes.push(
                <div
                    key={row}
                    className="flex absolute w-full left-0 right-0"
                    style={{
                        height: `${rowHeight}px`,
                        top: `${row * rowHeight}px`, // 核心：计算偏移量
                    }}
                >
                    {rowItems}
                </div>
            );
        }
        return renderedNodes;
    }, [items, columnCount, rowHeight, startRow, endRow, renderItem]);

    // 5. 滚动事件节流 (简单版直接设置，生产环境可用 lodash.throttle)
    const onScroll = (e) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    return (
        <div
            ref={containerRef}
            className="overflow-y-auto relative w-full no-scrollbar" // no-scrollbar 可选
            style={{ height: `${containerHeight}px` }}
            onScroll={onScroll}
        >
            {/* 占位层：撑开高度 */}
            <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                {visibleItems}
            </div>
        </div>
    );
}