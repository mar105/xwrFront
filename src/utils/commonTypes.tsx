export const componentType = {
  FormItemFieldDecorator: 'FormItemFieldDecorator', FieldDecorator: 'FieldDecorator', Soruce: 'Source' };

export const searchType = {
  tinyint: [{value: '等于', id: '='}],
  varchar: [{value: '包含', id: 'like'},
    {value: '不包含', id: 'not like'},
    {value: '等于', id: '='}],
  decimal: [{value: '大于', id: '>'},
    {value: '等于', id: '='},
    {value: '小于', id: '<'},
    {value: '大于等于', id: '>='},
    {value: '小于等于', id: '<='}],
  datetime: [{value: '区间', id: 'between'},
    {value: '区间时间', id: 'betweenTime'},
    {value: '大于', id: '>'},
    {value: '等于', id: '='},
    {value: '小于', id: '<'},
    {value: '大于等于', id: '>='},
    {value: '小于等于', id: '<='},
    {value: '今日', id: 'day'},
    {value: '本月', id: 'month'},
    {value: '上月', id: 'monthPre'},
    {value: '本周', id: 'week'}],
  month: [{value: '等于', id: '='}],
}
