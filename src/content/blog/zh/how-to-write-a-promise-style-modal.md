---
pubDatetime: 2024-02-26T16:40:15.000+08:00
modDatetime: 2024-02-29T11:32:42Z
title: 如何封装一个 Promise 风格的弹窗？
permalink: how-to-write-a-promise-style-dialog
featured: true
tags:
  - frontend
  - javascript
  - react
  - promise
  - async
description: 本文介绍了一种非常简洁的 Modal/Dialog 写法。
---

## 背景

纵观各大流行的 UI 库，所有的 `Modal`/`Dialog` 几乎全部都和原生 `dialog` 有着一样的 `API`，以 `antd` 为例：

- 一个 `open`/`visible` 状态控制弹窗的显隐性
- 最常见的 CRUD 页面“点击按钮弹出编辑表单”场景，还需要：
  - 一个 `loading` 状态控制按钮的加载状态
  - 如果要重用 `modal edit form`，还需要拿到 `formRef` 并且频繁地 `setFormFields()` 以重置表单默认值
  - 【可选】一个 `currentModel` 状态（或 `prop`）用来记录点击的是哪一行（行 `ID`）

```tsx
function someService(data: any) {
  return fetch("https://httpbin.org/delay/1", {
    body: JSON.stringify(data),
    method: "POST",
    mode: "cors",
  });
}

const App: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      console.log(`Logging in with:`, values);
      await someService(values);
      message.success("Login successful");
      setOpen(false);
    } catch (error) {
      message.error(error.message);
    }
    setConfirmLoading(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal title="Title" open={open} onOk={handleOk} confirmLoading={confirmLoading}>
        <Form>{/* FormItems */}</Form>
      </Modal>
    </>
  );
};
```

可以看出，状态变量以及更新变量的函数调用非常琐碎。

## 现有的一些优化方案：

### 列表中重用同一个 Modal

非常常见的写法，但是仔细看，状态、方法其实非常多，如果有多个 `Modal` + `Form` 的组合，那将是一场灾难（抽象成组件又要另外一种写法，状态变量不会变少，只会变多）。

```tsx
import React, { useState } from "react";
import { Form, Modal, Space, Table, Input, InputNumber, message } from "antd";
import type { TableProps } from "antd";

interface DataType {
  key: string;
  name: string;
  age: number;
}

function someService(data: DataType) {
  return fetch("https://httpbin.org/delay/1", {
    body: JSON.stringify(data),
    method: "POST",
    mode: "cors",
  });
}

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
  },
];

const App: React.FC = () => {
  const [form] = Form.useForm<Omit<DataType, "key">>();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [edittingModel, setEditModel] = useState<DataType | null>(null);

  useEffect(() => {
    if (open) {
      if (edittingModel) {
        form.setFieldsValue({
          name: edittingModel.name,
          age: edittingModel.age,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, edittingModel]);

  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      const values = await form.validateFields();
      await someService({ ...values, key: edittingModel.key });
      message.success("submit successful");
      setOpen(false);
    } catch (error) {
      message.error(error.message);
    }
    setConfirmLoading(false);
  };

  const columns: TableProps<DataType>["columns"] = [
    // ...
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setOpen(true);
              setEditModel(record);
            }}
          >
            Edit
          </a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={data} />
      <Modal
        title="Title"
        open={open}
        onOk={handleOk}
        onCancel={() => {
          setOpen(false);
        }}
        confirmLoading={confirmLoading}
        forceRender
      >
        <Form form={form} name="modaledit" labelCol={{ span: 6 }} wrapperCol={{ span: 12 }}>
          {/* FormItems */}
        </Form>
      </Modal>
    </>
  );
};

export default App;
```

### [Procomponents.ModalForm](https://procomponents.ant.design/components/modal-form)

挺好的，但它的 `API` 固定死了一个 `ModalForm` 搭配一个 `Button`，应对列表中每一行都有若干个按钮就有点不太优雅了。

```tsx
const columns: TableProps<DataType>["columns"] = [
  // ...
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space>
        {/* 每行都渲染一个 Modal + Form */}
        <ModalForm<DataType>
          trigger={<a>Edit</a>}
          form={form}
          submitTimeout={2000}
          onFinish={async values => {
            await someService(values);
            message.success("submit successful");
            return true;
          }}
        >
          {/* FormItems */}
        </ModalForm>
        <a>Delete</a>
      </Space>
    ),
  },
];
```

### [Modal.method()](https://ant-design.antgroup.com/components/modal-cn#modalmethod)

非常理想的方法，不需要维护`visible`/`confirmLoading`，但官方并不支持表单场景，而且 `props` 也是阉割版。

## 一种“新”的思想

> 实际上并不是“新”，只是很少有人使用。

回想一下 `const name = window.prompt("please type a name")` 这段代码，它非常简单，无需维护任何 `visible`/`confirmLoading` 属性，也不必声明什么 `model`/`dialog`。为什么我们不能使用这样的 `API` 呢？其实就是将一个 `input` 替换成一个 `form` 而已。

### 幻想时间（API 设计）

有没有一种可能，一句话的需求就应该能用一段代码解决，根本不需要那么多状态变量？

比如上面的需求一句话总结就是：“点击‘编辑’按钮打开一个弹窗表单，用户修改表单后点击确定就提交，提交有 `loading` 效果，提交成功后就关闭弹窗，提交失败不关闭。”

理想的代码如下：

- 点击时按需创建 Modal 和 Form；
- 不需要维护 visible，创建即打开 Modal；
- 点击“确认”，自动校验表单，按钮自动开始 loading；
- 表单检验完成后，把表单的值自动传递给 props.onOk，提交到 API；
- onOk 支持异步（返回 promise），成功后自动关闭 Modal；
- onOk 失败时, error 传递给单独的 onFailed 处理, 自动结束 loading，并且不关闭 Modal 以继续修改表单值;
- 由于每次都是新的Form，所以也不需要什么 form.setFieldsValue()，初始化直接使用 initialValues；
- 所有 modalProps 都原封不动的保留
- 本身是一个异步函数，可以轻松和其他异步任务实现串行、并行等...
- 可以脱离页面事件运行，比如：请求返回401时，弹出一个 ModalForm

```tsx
const columns: TableProps<DataType>["columns"] = [
  // ...
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space>
        <a
          onClick={() => {
            await createModal<DataType>({
              title: "Edit",
              maskClosable: false,
              children: <Form initialValues={{ name: record.name }}>{/* FormItems */}</Form>,
              async onOk(values) {
                await someService({ ...values, key: record.key });
                message.success("submit successful");
              },
              async onFailed(error) {
                message.error(error.message);
              },
            });
          }}
        >
          Edit
        </a>
        <a>Delete</a>
      </Space>
    ),
  },
];
```

答案是肯定的，并且已经[开源](https://github.com/bowencool/create-antd-modal)，稳定运行好几年了。下面讲一下实现原理和遇到的一些问题：

### 基本功能实现

TODO（可以先查看[源代码](https://github.com/bowencool/create-antd-modal)）

### 一些问题及优化

#### Context Providing

由于每次创建的 `Modal` 及其内容都是新的 `ReactElement`，和整个应用不是同一个 `Root` 实例，导致了 `Modal` 及其内容获取不到应用里的 `Context`，这一点曾经也困扰了我挺长时间的。

##### modalRender

我一开始想的是利用 `ModalProps.modalRender` 把需要的 `Context Providers` 都传进去：

```diff
createModal<DataType>({
  title: "Edit",
  maskClosable: false,
+ modalRender: (modal) => <ContextProviders>{modal}</ContextProviders>,
  children: <Form initialValues={{ name: record.name }}>{/* FormItems */}</Form>,
  async onOk(values) {
    await someService({ ...values, key: record.key });
    message.success("submit successful");
  },
});
```

然后再封装一个高阶函数用来填充一些默认参数和通用参数以简化代码。但这样也有缺点：并非所有的 `ContextProvider` 都是 Root 级别的，如果有个页面级别的 `ContextProvider`，又要再写一遍 `modalRender`，很不方便。

最初的版本是这样的，但我始终认为有更好的方案。因此，我一直觉得这个项目还未完成，也没有进行宣传推广。

```ts
export function createFunctionWithDefaultProps<T, R = void>(defaultParams: CreateModalProps<T, R>) {
  const newFunction: typeof createModal<T, R> = params => createModal<T, R>({ ...defaultParams, ...params });
  return newFunction;
}
```

##### contextHolder

后来我参考了 antd 官方 [Modal.useModal()](https://ant-design.antgroup.com/components/modal-cn#modalusemodal)，直接把新创建的 `ReactElement` 挂到 `Root` 下，这样不需要处理 `Context` 了：

```tsx
const Demo: React.FC = () => {
  const [contextHolder, createModal] = useModalCreation({
    // optional default params
    maskClosable: false,
    okText: "提交",
    maskStyle: {
      opacity: 0.8,
    },
  });
  return (
    <RootContainer>
      <Button
        onClick={() => {
          createModal({
            title: "Some title",
            content: "You can see that the i18n and theme configuration works now",
          });
        }}
      >
        Context Providing
      </Button>
      {contextHolder}
    </RootContainer>
  );
};
```

原理头一回也没看懂，隔段时间再去看，突然就懂了，其实也很简单：

**`contextHolder` 其实就是一个 `ReactNode[]`，调用 `createModal()` 的时候，把 `<Modal><Form>{children}</Form></Modal>` 加到数组里就行了（当然还有合适的移除时机），用户直接在页面组件里渲染这个 `ReactNode[]` 就完事了。**

恍然大悟，豁然开朗，醍醐灌顶，妙啊！

##### rootComponent

<!-- TODO -->

像 [shadcn toast](https://ui.shadcn.com/docs/components/toast) 那样，也是一种好的设计，但我觉得跟 `contextHolder` 方案差不多，有时间再更新了。

#### 双击按钮弹出两个 Modal

由于每次都是函数式调用，所以只需要加个 throttle 即可，时间间隔只需要取 `Modal` 的动画时间即可，因为 `Modal` 弹出动画结束时，mask 就会把按钮挡住。

## 最后

本文介绍的实现方法已经[开源](https://github.com/bowencool/create-antd-modal)并发布到 npm，欢迎大家直接使用。

根据这个思路，你可以轻松创建各种弹出层组件，如 Drawer、[ImagePreview](https://bowencool.github.io/create-antd-modal/documents/functions/create-image-preview)、Notification 等。

> 我曾向 antd 提交了一个 [PR](https://github.com/ant-design/ant-design/pull/39660)，但遗憾地被关闭了。
