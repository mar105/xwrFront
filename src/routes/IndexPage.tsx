import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="IndexPage">完善店铺</a>
      <a href="IndexPage">发布课程</a>
    </div>
  );
}

export default connect()(IndexPage);
