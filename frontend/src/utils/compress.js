/**
 * 前端图片压缩与格式转换工具
 * @param {File} file - 原始文件对象
 * @param {number} quality - 压缩质量 (0-1)，默认 0.7
 * @param {number} maxWidth - 最大宽度，默认 1920px (超过此宽度会等比缩放)
 * @returns {Promise<File>} - 返回压缩后的 WebP 文件对象
 */
export const compressImage = async (file, quality = 0.7, maxWidth = 1920) => {
    // 如果不是图片，直接返回原文件
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                // 1. 计算缩放后的尺寸 (保持纵横比)
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // 2. 创建 Canvas 并绘制
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // 铺白底（防止 PNG 透明背景变黑）
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // 3. 导出为 WebP Blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            console.error('Canvas to Blob failed');
                            resolve(file); // 失败降级返回原文件
                            return;
                        }

                        // 4. 重组为 File 对象
                        const newFileName = file.name.replace(/\.\w+$/, '.webp');
                        const newFile = new File([blob], newFileName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });

                        // 打印日志方便面试演示
                        console.log(`🖼️ 图片压缩完成: 
                原体积: ${(file.size / 1024).toFixed(2)}KB 
                新体积: ${(newFile.size / 1024).toFixed(2)}KB 
                压缩率: ${((1 - newFile.size / file.size) * 100).toFixed(0)}%`);

                        resolve(newFile);
                    },
                    'image/webp', // 目标格式
                    quality       // 质量
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};