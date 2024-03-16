---
pubDatetime: 2024-03-16T20:29:30.000+08:00
modDatetime: 2024-03-16T20:29:30.000+08:00
title: 如何使用 Ant Design Table 表格实现无限滚动
permalink: infinite-scrolling-antd-table
tags:
  - react
  - frontend
description: 本文将指导您如何在 Ant Design Table 表格中实现无限滚动。
---

## 代码

```tsx
import { useInfiniteScroll } from "ahooks";

export default function OrderManagement() {
  // ...
  const {
    data,
    loading,
    loadingMore,
    noMore,
    cancel,
    loadMore,
    reload: updateList,
    error,
  } = useInfiniteScroll<{
    list: Order[];
    // 根据接口自行定义参数，以 cursor 为例
    cursor?: string;
    done: boolean;
  }>(
    currentData =>
      getOrders({
        cursor: currentData?.cursor,
        limit: defaultPageSize,
      }),
    {
      target: () => document.querySelector(".ant-table-body"),
      // manual: true,
      isNoMore: d => {
        return d?.done || false;
      },
    }
  );

  // ProTable 同样适用
  return (
    <Table
      // ...
      dataSource={data?.list}
      loading={loading}
      rowKey="id"
      pagination={false}
      scroll={{ scrollToFirstRowOnChange: false, y: "calc(100vh - 200px)" }}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={6}>
            <div className="text-center">
              {loadingMore && <Spin />}
              {noMore && <span>{t("feedback.noMore")}</span>}
              {error && (
                <span className="text-red-500">
                  {error2String(error) || t("error")}
                  <br />
                  <a
                    onClick={() => {
                      loadMore();
                    }}
                  >
                    {t("actions.retry")}
                  </a>
                </span>
              )}
            </div>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
      columns={
        [
          /*..*/
        ]
      }
    />
  );
}
```
