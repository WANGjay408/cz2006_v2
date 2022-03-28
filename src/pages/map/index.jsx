import './index.css';
import { Input } from 'antd';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

const MapPage = () => {
    function callback(key) {
        console.log(key);
    }

    return (
        <section className="map-page">
            <div className='header'>
                <Input
                    placeholder='Choose Starting Point' />
                <Input
                    placeholder='Choose Ending Point' />
            </div>
            <div className='result-box'>
                <div className='list'>
                    <div>

                    </div>
                    <div>
                        <Tabs defaultActiveKey="1" onChange={callback}>
                            <TabPane tab="Tab 1" key="1">
                                Content of Tab Pane 1
                            </TabPane>
                            <TabPane tab="Tab 2" key="2">
                                Content of Tab Pane 2
                            </TabPane>
                            <TabPane tab="Tab 3" key="3">
                                Content of Tab Pane 3
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <div className='google-map'>

                </div>
            </div>
        </section>
    );
}

export default MapPage;