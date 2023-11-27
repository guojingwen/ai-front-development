export function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
  return new Promise((resolve, reject) => {
    // 创建一个Blob对象
    let blob = new Blob([arrayBuffer], {
      type: 'application/octet-stream',
    });

    // 创建一个FileReader对象
    let reader = new FileReader();

    // 定义文件读取成功后的回调函数
    reader.onloadend = function () {
      // 获取Data URL
      let dataUrl = reader.result! as string;
      console.log(dataUrl);
      // 提取Base64字符串
      let base64 = dataUrl.split(',')[1];
      resolve(base64);
    };

    // 定义文件读取失败的回调函数
    reader.onerror = function (error) {
      reject(error);
    };

    // 读取Blob对象
    reader.readAsDataURL(blob);
  });
}
