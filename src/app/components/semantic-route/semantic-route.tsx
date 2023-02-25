import { Breadcrumb } from 'antd';
import './semantic-route.scss';

const SemanticRoute = (props: any) => {

  return (
    <div className="semantic-route">
      <Breadcrumb>
        {
          props.route.map((topic: string, index: number) => (
            <Breadcrumb.Item key={index}>
              {
                index < props.route.length-1 ?
                (<a onClick={() => console.log('jump to semantic instance', topic)}>{topic}</a>) :
                (<>{topic}</>)
              }
            </Breadcrumb.Item>
          ))
        }
        {/* <Breadcrumb.Item menu={{ items }}>
          <a href="">General</a>
        </Breadcrumb.Item> */}
      </Breadcrumb>
    </div>
  )
}

export default SemanticRoute;