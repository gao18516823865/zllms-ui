<template>
  <div>
    <PageContent v-bind="pageOptions" />
  </div>
</template>
<script>
import PageContent from '@/components/PageContent';
export default {
  name: 'Ts',
  components: { PageContent },
  data() {
    return {
      pageOptions: {
        searchItems: [
          {
            label: '公司名称',
            key: 'companyName'
          },
          {
            label: '状态',
            key: 'status',
            type: 'select',
            options: [
              {
                label: '未处理',
                value: 0,
              }, {
                label: '处理成功',
                value: 1,
              }, {
                label: '处理失败',
                value: 2,
              }
            ]
          },
          {
            label: '日期',
            type: 'date',
            key: 'time',
          },
          {
            label: '日期范围',
            type: 'daterange',
            key: ['startTime', 'endTime'],
          },
          {
            label: '月份范围',
            type: 'monthrange',
            key: ['startMonth', 'endMonth'],
          }
        ],
        customButtons: [
          {
            label: 'add',
            onClick: (e) => { console.log('点击==add', e); },
            type: 'success'
          }, {
            label: 'defualt',
            onClick: (e) => { console.log('点击==default', e); },
          }, {
            label: 'primary',
            onClick: (e) => { console.log('点击==primary', e); },
            type: 'primary'
          }
        ],
        // checkbox
        selection: true,
        selectionChange: (e) => {
          console.log(e, 'selectionChange');
        },
        columns: [
          {
            label: '公司名称',
            prop: 'companyName'
          },
          {
            label: '用户名称',
            prop: 'userName'
          }, {
            label: '手机号',
            prop: 'phone'
          }, {
            label: '状态',
            prop: 'status',
            render(scope) {
              const statusMap = {
                0: '未处理',
                1: '处理成功',
                2: '处理失败'
              };
              return statusMap[scope.row.status];
            }
          },
          {
            type: 'handle',
            title: '操作',
            handleList: [
              {
                label: '删除',
                onClick(e) {
                  console.log('删除', e);
                }
              }
            ]
          }
        ],
        fetchUrl: '/preregistration/list'
      }
    };
  }
};
</script>
