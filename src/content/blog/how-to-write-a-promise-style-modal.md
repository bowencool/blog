---
pubDatetime: 2024-02-26T16:40:15.000+08:00
modDatetime: 2024-03-05T13:14:51Z
title: How to write a promise-style dialog?
permalink: how-to-write-a-promise-style-dialog
featured: true
tags:
  - frontend
  - javascript
  - react
  - async
description: This article introduces a very concise way of writing Modal/Dialog.
---

## Background

Looking at various popular UI libraries, all `Modal`/`Dialog` components almost always have the same `API` as the native `dialog`. Taking `antd` as an example:

- An `open`/`visible` state controls the visibility of the popup.
- For the most common CRUD page scenario "click button to pop up edit form", you also need:
  - A `loading` state to control the loading status of buttons.
  - If you want to reuse a 'modal edit form', you need access to a 'formRef' and frequently use 'setFormFields()' to reset default values in forms.
  - [Optional] A 'currentModel' state (or 'prop') for recording which row (row ID) was clicked.

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

As you can see, the state variables and the function calls to update them are very trivial.

## Existing optimization solutions:

### Reusing the same Modal in a list

A very common practice, but if you look closely, there are actually many states and methods involved. If there are multiple `Modal` + `Form` combinations, it would be a disaster (abstracting into components requires another way of writing, and the number of state variables will not decrease but increase).

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

It's pretty good, but its `API` is fixed to a `ModalForm` paired with a `Button`, which becomes a bit inelegant when dealing with several buttons in each row of the list.

```tsx
const columns: TableProps<DataType>["columns"] = [
  // ...
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space>
        {/* Each line renders a Modal + Form. */}
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

### [Modal.method()](https://ant.design/components/modal#modalmethod)

A very ideal method, it does not require maintenance of `visible`/`confirmLoading`, but the official does not support form scenarios, and the `props` are also a castrated version.

## A "New" Idea

> It's actually not "new," just rarely used by people.

Think back to the code `const name = window.prompt("please type a name")`, it is very simple, there is no need to maintain any `visible`/`confirmLoading` properties, nor is there a need to declare any `model`/`dialog`. Why can't we use such an `API`? It's really just replacing an `input` with a `form`.

### Fantasy Time (API Design)

Is there a possibility that a requirement expressed in one sentence should be solvable with just a piece of code, without the need for so many state variables?

For example, the above requirement can be summarized in one sentence as: "Clicking the 'edit' button opens a pop-up form, after the user modifies and confirms the form it is submitted with a `loading` effect, and upon successful submission, the pop-up closes; if submission fails, it does not close."

The ideal code would be as follows:

- Create Modal and Form on demand when clicked;
- No need to maintain visibility, create to open Modal directly;
- Click "Confirm" to automatically validate the form, and the button starts loading automatically;
- After the form validation is completed, pass the values of the form automatically to props.onOk and submit them to API;
- onOk supports asynchronous (returns promise), closes Modal automatically after success;
- In case of onOk failure, error is passed to a separate onFailed for handling, automatically ends loading without closing Modal so that users can continue modifying form values;
- Since it's always a new Form, there's no need for something like form.setFieldsValue(), just use initialValues directly for initialization;
- All modalProps are kept intact
- It is an asynchronous function itself, which can easily implement serialization, parallelization, etc. with other asynchronous tasks...
- Can be run independently of page events, e.g., when a request returns 401, a ModalForm pops up.

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

The answer is yes, and it has been [open source](https://github.com/bowencool/create-antd-modal) and has been running stably for several years. Let’s talk about the implementation and some problems encountered:

### Basic function implementation

TODO (you can check [source code](https://github.com/bowencool/create-antd-modal) first)

### Some problems and optimizations

#### Context Providing

Since the `Modal` and its content is a new `ReactElement` every time it is created, it is not the same `Root` instance as the whole application, so the `Modal` and its content can't get the `Context` in the application, which has been bothering me for a long time.

##### modalRender

What I initially thought was to use `ModalProps.modalRender` to pass in all the required `Context Providers`:

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

Then encapsulate a higher-order function to fill in some default parameters and general parameters to simplify the code. However, this also has disadvantages: not all `ContextProvider` are at the Root level, if there is a page-level `ContextProvider`, you have to write `modalRender` again, which is very inconvenient.

The initial version was like this, but I always thought there was a better solution. As a result, I always felt that the project was unfinished and did not promote it.

```ts
export function createFunctionWithDefaultProps<T, R = void>(defaultParams: CreateModalProps<T, R>) {
  const newFunction: typeof createModal<T, R> = params => createModal<T, R>({ ...defaultParams, ...params });
  return newFunction;
}
```

##### contextHolder

Later on, I referred to the official [Modal.useModal()](https://ant.design/components/modal#modalusemodal) of antd and directly mounted the newly created `ReactElement` under `Root`, so there is no need to deal with `Context` anymore:

```tsx
const Demo: React.FC = () => {
  const [contextHolder, createModal] = useModalCreation({
    // optional default params
    maskClosable: false,
    okText: "Submit",
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

I didn't understand the principle at first, but after some time when I looked at it again, I suddenly got it. It's actually quite simple:

**`contextHolder` is essentially a `ReactNode[]`. When `createModal()` was called, all we need to do is add `<Modal><Form>{children}</Form></Modal>` into the array (of course there's also an appropriate time to remove it). The user just needs to render this `ReactNode[]` in their page component and that’s it.**

It was like a sudden realization, as if everything became clear, like being enlightened with profound knowledge - brilliant!

##### rootComponent

<!-- TODO -->

Something like [shadcn toast](https://ui.shadcn.com/docs/components/toast) is also a good design, but I think it's similar to the `contextHolder` solution, I'll update it when I have time.

#### Double clicking the button brings up two Modal

Since it is a functional call every time, we only need to add a throttle. The time interval only needs to take the animation time of `Modal`, because when the pop-up animation of `Modal` ends, the mask will cover the button.

## Finally

The implementation method introduced in this article has been [open-sourced](https://github.com/bowencool/create-antd-modal) and published to npm, and everyone is welcome to use it directly.

Based on this idea, you can easily create various pop-up components such as Drawer, [ImagePreview](https://bowencool.github.io/create-antd-modal/documents/functions/create-image-preview), Notification, etc.

> I once submitted a [PR](https://github.com/ant-design/ant-design/pull/39660) to antd, but unfortunately it was closed.
