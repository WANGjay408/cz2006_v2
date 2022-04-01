import './index.css';
import { Input } from 'antd';
import { Tabs, Card } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { carparkList } from '../../store/carpark';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import { Trans97 } from 'trans97';
const trans97 = new Trans97({
    type: 'wgs84'
});

const { TabPane } = Tabs;

const AnyReactComponent = ({ text }) => <div>{text}</div>;

const MapPage = (props) => {
    const mapRef = useRef();
    const mapsRef = useRef();

    const height = window.innerHeight;

    function callback(key) {
        console.log(key);
    }

    const [sortList, setSortList] = useState(null);
    const [availableList, SetAvailableList] = useState(null)

    const getLotAvailability = useCallback(async () => {
        let response = await axios
            .get("https://api.data.gov.sg/v1/transport/carpark-availability")
            .catch(err => console.log(err));
        SetAvailableList(response.data.items[0].carpark_data || [])
        // console.log(response.data)
    }, [SetAvailableList])

    const initMap = useCallback(() => {
        if (mapRef.current && mapsRef.current) {
            console.log(sortList)
            loadMapRoute(mapRef.current, mapsRef.current,
                new mapsRef.current.LatLng(1.3378875, 103.8859798),
                sortList[0].address
            )
        }
    }, [sortList, mapRef, mapsRef])

    useEffect(() => {
        getLotAvailability();
    }, [getLotAvailability]);

    useEffect(() => {
        const data = carparkList.map(v => {
            return {
                "y_coord": v['y_coord'],
                "x_coord": v['x_coord'],
                "address": v['address'],
                "car_park_no": v['car_park_no'],
            }
        })
        var nearCarparks = data.map(v => {
            const pow_1 = Math.pow((v['x_coord'] - 1.372702), 2)
            const pow_2 = Math.pow((v['y_coord'] - 1.372702), 2)
            return {
                dis: pow_1 + pow_2,
                "y_coord": v['y_coord'],
                "x_coord": v['x_coord'],
                "address": v['address'],
                "car_park_no": v['car_park_no'],
            }
        })

        const selectionSort = (arr) => {
            var len = arr.length;
            var minIndex, temp;
            for (var i = 0; i < len - 1; i++) {
                minIndex = i;
                for (var j = i + 1; j < len; j++) {
                    if (arr[j].dis < arr[minIndex].dis) {
                        minIndex = j;
                    }
                }
                temp = arr[i];
                arr[i] = arr[minIndex];
                arr[minIndex] = temp;
            }
            return arr;
        }
        const value = selectionSort(nearCarparks).slice(0, 5)
        setSortList(value.map(pos => {
            const posTransfered = trans97.getLocation(pos.x_coord, pos.y_coord)
            console.log(posTransfered)
            return {
                ...pos,
                lat: posTransfered.x,
                lng: posTransfered.y
            }
        }));
        console.log(value)

    }, [])

    if (sortList === null) {
        return null
    }

    return (
        <section className="map-page" style={{ height: height }}>
            <div className='header'>
                <Input
                    placeholder='Choose Starting Point' />
                <Input
                    placeholder='Choose Ending Point' />
            </div>
            <div className='result-box'>
                <div className='list'>
                    <div>
                        <Tabs defaultActiveKey="1" onChange={callback}>
                            <TabPane tab="Nearest 5 Carparks" key="1">
                                {sortList.length > 0 && sortList.map((v, t) => {
                                    return <div style={{ marginTop: '20px' }}>
                                        <Card title={v["address"]} key={t}>
                                            <p>{v['address']}</p>
                                            <p>{v['car_park_no']}</p>
                                        </Card>
                                    </div>
                                })
                                }
                            </TabPane>
                            <TabPane tab="Avalible" key="2">
                                {sortList.length > 0 && sortList.map((v, t) => {
                                    return <div style={{ margin: '20px ' }}>
                                        <Card title={v["address"]} key={t}>
                                            <p>{v['address']}</p>
                                            <p>{v['car_park_no']}</p>
                                        </Card>
                                    </div>
                                })
                                }
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <section className='google-map'>
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: 'AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4' }}
                        defaultCenter={{
                            lat: 1.3378875,
                            lng: 103.8859798
                        }}
                        defaultZoom={11}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={({ map, maps }) => {
                            mapRef.current = map;
                            mapsRef.current = maps;
                            initMap();
                        }}
                    />
                </section>
            </div>
        </section>
    );
}

export default MapPage;

function loadMapRoute(map, maps, origin, destination) {
    const directionsService = new maps.DirectionsService();
    const directionsRenderer = new maps.DirectionsRenderer({
        draggable: true,
        map,
        panel: document.getElementById("panel"),
    });
    directionsRenderer.addListener("directions_changed", () => {
        const directions = directionsRenderer.getDirections();

        if (directions) {
            computeTotalDistance(directions);
        }
    });
    displayRoute(
        origin,
        destination,
        directionsService,
        directionsRenderer,
        maps
    );
}

function displayRoute(origin, destination, service, display, maps) {
    service
        .route({
            origin: origin,
            destination: destination,
            travelMode: maps.TravelMode.DRIVING,
            avoidTolls: true,
        })
        .then((result) => {
            display.setDirections(result);
        })
        .catch((e) => {
            alert("Could not display directions due to: " + e);
        });
}

function computeTotalDistance(result) {
    let total = 0;
    const myroute = result.routes[0];

    if (!myroute) {
        return;
    }

    for (let i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }

    total = total / 1000;
    console.log(total)
    // document.getElementById("total").innerHTML = total + " km";
}
