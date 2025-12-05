import { useState, useRef } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { compressImage } from '../utils/compress';
import { error } from '../utils/toast';

// --- 子组件：可排序的图片卡片 ---
function SortablePhoto({ file, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            // 改动 1: 移除 aspect 比例类，防止高度被强制压缩
            className="relative group cursor-move touch-none"
        >
            {/* 改动 2: h-24 -> h-32 (增高容器)
         改动 3: bg-white -> bg-gray-100 (给留白区域加底色)
         改动 4: flex 布局居中图片
      */}
            <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-sm hover:shadow-md transition-shadow relative flex items-center justify-center">
                <img
                    src={file.id}
                    alt="preview"
                    // 改动 5: object-cover -> object-contain (核心：确保完整显示)
                    className="max-w-full max-h-full object-contain pointer-events-none"
                />

                {/* 标签信息 */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 text-center truncate">
                    WebP · {(file.size / 1024).toFixed(0)}KB
                </div>

                {/* 删除按钮 */}
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onRemove(file.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

// --- 主组件 (逻辑保持不变) ---
export default function ImageUploader({ files, setFiles, maxFiles = 5 }) {
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > maxFiles) {
            return error(`最多只能上传 ${maxFiles} 张图片`);
        }

        setIsCompressing(true);
        try {
            const compressedTasks = selectedFiles.map(file => compressImage(file));
            const compressedFiles = await Promise.all(compressedTasks);
            const newFilesWithId = compressedFiles.map(f => Object.assign(f, { id: URL.createObjectURL(f) }));
            setFiles([...files, ...newFilesWithId]);
        } catch (err) {
            console.error(err);
            error('图片处理失败');
        } finally {
            setIsCompressing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeFile = (id) => {
        setFiles(files.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isCompressing ? 'bg-gray-100 border-gray-400 cursor-wait' : 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100 cursor-pointer'}
        `}
                onClick={() => !isCompressing && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isCompressing}
                />
                <div className="space-y-1">
                    {isCompressing ? (
                        <p className="text-indigo-600 font-medium animate-pulse">⚡ 智能压缩处理中...</p>
                    ) : (
                        <>
                            <p className="text-lg font-medium text-indigo-600">📸 点击上传图片</p>
                            <p className="text-xs text-gray-500">自动转 WebP / 支持网格拖拽排序 / Max {maxFiles}</p>
                        </>
                    )}
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={files.map(f => f.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-3 gap-3">
                        {files.map((file) => (
                            <SortablePhoto key={file.id} file={file} onRemove={removeFile} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}