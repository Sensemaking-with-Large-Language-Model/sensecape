import { Breadcrumb } from 'antd';
import './semantic-route.scss';
import 'reactjs-popup/dist/index.css';
import Popup from 'reactjs-popup';
import { SemanticRouteItem } from '../../triggers/semantic-dive/semantic-dive.helper';

const SemanticRoute = (props: any) => {

  const cappedTitle = (title: string) => {
    if (title.length > 50) {
      return title.substring(0, 50) + '...';
    }
    return title;
  }

  return (
    <Popup trigger={<div className="semantic-route">
      <Breadcrumb>
        {
          props.route.map((routeItem: SemanticRouteItem, index: number) => (
            <Breadcrumb.Item key={index}>
              {(<a
                style={props.currentTopicId === routeItem.topicId ?
                  {
                    color: '#000',
                    fontWeight: '500',
                    textDecoration: routeItem.topicId.startsWith('topic-home') ? 'underline': '',
                  } : {
                    textDecoration: routeItem.topicId.startsWith('topic-home') ? 'underline': '',
                  }}
                onClick={() => props.semanticJumpTo(routeItem.topicId)}
              >
                {cappedTitle(routeItem.title)}
              </a>)}
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