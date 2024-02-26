# 使用ChatGPT开发英语学习助手
![image](./files/welcome.webp)

<video ><video>
<video width="800" id="video" controls>
    <source src="./files/english-learn2.mp4" type="video/mp4">
</video>
项目目录如下

```txt
|-
  |- english-assistant 基于OpenAI API 开发一个英语学习助手
  |- assistant ChatGPT接入钉钉、飞书、微信公众号的示例代码
  |- langchain AI前端框架学习，结合企业场景写一些示例Demo
```

## 英语学习助手

通过这个项目你可以快速上手ChatGPT的前端开发

- 首先要配置 `API_KEY` 这个在 [platform.openai.com](https://platform.openai.com/api-keys) 配置，[参考官方文档](https://platform.openai.com/docs/quickstart)
- 项目技术栈 使用`React`+ `typescript`开发，样式使用 `tailwindcss`，UI使用`@mantine/core`，使用`indexedDB`存储无后端服务
- 项目参考ChatGPT的UI布局，分三个模块，助理管理、会话列表、消息列表，左右布局，左边是会话列表，右边是消息列表，
- 助理管理其实是 OpenAI官方的 接口配置，具体参数的含义请参考官网，这里不细说。通过配置不同的指令及其他参数实现不同的模式，如英语学习、语文学习等
- 支持发送文字，支持打字效果、支持markdown渲染、支持停止回复
- 支持语音功能，类似微信语音，使用indexedDB存储，可回放。注意：官方并不支持直接语音，需要通过文字转语音，语音再转文字的接口中转
- 支持白天晚上主题模式切换

项目中使用了一些设计模式

- 单例模式： 语音播放、发送消息（对fetch的封装）
- 发布订阅模式： 使用EventEmitter用于一些非父子组件间的通信
- 门面模式：解决兼容性问题
- 流水线模式：关于业务逻辑的处理采用pipeline模式，逻辑清晰

You are an English teacher, No matter what I say, please answer in English
You are a Chinese teacher, No matter what I say , you should answer with chinese
You are an English translator， No matter what I say, you should translate it with English

大家好，我叫GuoGuo，给大家介绍一下我最近做的一个小项目，英语学习助手w, 写这个小项目主要是为了熟悉React+Typescript开发，熟悉tailwindcss，熟悉indexedDB，还是就是熟悉AI前端开发
