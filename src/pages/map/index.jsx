import './index.css';
import { Button, Input } from 'antd';
import { Tabs, Card } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { carparkList } from '../../store/carpark';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import { Trans97 } from 'trans97';
const trans97 = new Trans97({
    type: 'twd97'
});

const { TabPane } = Tabs;

const MapPage = (props) => {
    const mapRef = useRef();
    const mapsRef = useRef();

    const height = window.innerHeight;

    function callback(key) {
        console.log(key);
    }

    const [sortList, setSortList] = useState(null);
    const [availableList, SetAvailableList] = useState(null);
    const [curDestination, setCurDestination] = useState(null);
    const [startLocation, setStartLocation] = useState(null);


    // get available carpark list
    const getLotAvailability = useCallback(async () => {
        // let response = await axios
        //     .get("https://api.data.gov.sg/v1/transport/carpark-availability")
        //     .catch(err => console.log(err));
        // SetAvailableList(response.data.items[0].carpark_data || []);
        const id = await axios
            .get("https://maps.googleapis.com/maps/api/geocode/json?address='BLOCK 253 ANG MO KIO STREET 21'&key=AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4")
            .catch(err => console.log(err));
        console.log(id)
    }, [])

    //init Map
    const initMap = useCallback((des) => {
        setCurDestination(des);
        if (mapRef.current && mapsRef.current) {
            loadMapRoute(mapRef.current, mapsRef.current,
                new mapsRef.current.LatLng(startLocation.latitude, startLocation.longitude),
                des ? des.address : sortList[0].address
            )
        }
    }, [sortList, mapRef, mapsRef, startLocation])
    //get current location
    const getCurrentLocation = useCallback(() => {
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        function success(pos) {
            var crd = pos.coords;
            setStartLocation(crd);
        }
        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }
        navigator.geolocation.getCurrentPosition(success, error, options);
    }, [])

    //sort nearest carpark
    const nearList = useCallback(() => {
        const data = carparkList.map(v => {
            return {
                "y_coord": v['y_coord'],
                "x_coord": v['x_coord'],
                "address": v['address'],
                "car_park_no": v['car_park_no'],
            }
        })

        if (!startLocation) return null;

        var nearCarparks = data.map(v => {
            const current = trans97.getLocation(
                startLocation.latitude,
                startLocation.longitude
            );
            // console.log(current, v);
            const pow_1 = Math.pow((v['x_coord'] - current.x), 2)
            const pow_2 = Math.pow((v['y_coord'] - current.y), 2)
            return {
                dis: Math.sqrt(pow_1 + pow_2),
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
        const value = selectionSort(nearCarparks).slice(0, 5);

        setSortList(value.map(pos => {
            const posTransfered = trans97.getLocation(pos.x_coord, pos.y_coord)
            console.log(posTransfered)
            return {
                ...pos,
                lat: posTransfered.x / 10000,
                lng: posTransfered.y / 10000
            }
        }));
    }, [startLocation]);

    const auto = useCallback(async (e) => {
        await axios
            .get(`https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=${e}&key=AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4`)
            .catch(e => console.log(e))
        // mapsRef.current.Autocomplete(input);
        console.log('--')
    }, [])

    useEffect(() => {
        getLotAvailability();
        nearList();
        getCurrentLocation();
    }, [getLotAvailability, nearList, getCurrentLocation]);

    if (sortList === null) {
        return null
    }

    return (
        <section className="map-page" style={{ height: height }}>
            <div className='header'>
                <Input
                    id="locationTextField"
                    placeholder='Choose Ending Point'
                    onChange={(e) => auto(e.target.value)} />
                <Button
                    style={{
                        marginLeft: '15px',
                        background: '#1990ff',
                        color: 'white',
                        borderRadius: '10px',
                        border: 'none'
                    }}
                >Search</Button>
            </div>
            <div className='result-box'>
                <div className='list'>
                    <div>
                        <Tabs
                            defaultActiveKey="1"
                            onChange={callback}
                            style={{ padding: '0 10px', height: '650px', overflow: 'scroll' }}
                        >
                            <TabPane tab="Nearest 5 Carparks" key="1">
                                {sortList.length > 0 && sortList.map((v, t) => {
                                    return <div style={{ marginTop: '20px' }}>
                                        <Card
                                            className={curDestination === v ? 'active card' : 'card'}
                                            title={v["address"]}
                                            key={t}
                                            onClick={() => initMap(v)}
                                        >
                                            <p>{v['address']}</p>
                                            <p>{v['car_park_no']}</p>
                                        </Card>
                                    </div>
                                })
                                }
                            </TabPane>
                            {/* <TabPane tab="Avalible Carparks" key="2">
                                {availableList.length > 5 && availableList.slice(0, 5).map((v, t) => {
                                    return <div style={{ marginTop: '20px' }}>
                                        <Card
                                            className={curDestination === v ? 'active card' : 'card'}
                                            title={v["carpark_number"]}
                                            key={t}
                                            onClick={() => initMap(v)}
                                        >
                                            <p>{v['carpark_number']}</p>

                                        </Card>
                                    </div>
                                })
                                }
                            </TabPane> */}
                        </Tabs>
                    </div>
                </div>
                <section className='google-map'>
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: 'AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4' }}
                        defaultCenter={{
                            lat: startLocation.latitude,
                            lng: startLocation.longitude,
                        }}
                        defaultZoom={11}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={({ map, maps }) => {
                            mapRef.current = map;
                            mapsRef.current = maps;
                            initMap();
                        }}
                        onClick={(e) => console.log(e)}
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
    // console.log(total)
    // document.getElementById("total").innerHTML = total + " km";
}
