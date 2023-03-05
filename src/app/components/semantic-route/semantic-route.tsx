import { Breadcrumb } from 'antd';
import './semantic-route.scss';
import 'reactjs-popup/dist/index.css';
import Popup from 'reactjs-popup';

const SemanticRoute = (props: any) => {

  return (
    <Popup trigger={<div className="semantic-route">
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
    </div>}
    on="hover"
    position="right center">
      <span>Indicates which level you are in</span>
    </Popup>
  )
}

export default SemanticRoute;