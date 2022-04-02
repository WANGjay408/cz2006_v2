import './index.css';
import { Button, Input } from 'antd';
import { Tabs, Card } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { carparkList } from '../../store/carpark';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';

const { TabPane } = Tabs;

const MapPage = (props) => {
    const mapRef = useRef();
    const mapsRef = useRef();

    const height = window.innerHeight;

    function callback(key) {
        console.log(key);
    }

    const [sortList, setSortList] = useState(null);
    // const [availableList, SetAvailableList] = useState(null);
    const [curDestination, setCurDestination] = useState(null);
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);


    // get available carpark list
    const getLotAvailability = useCallback(async () => {
        // let response = await axios
        //     .get("https://data.gov.sg/api/action/datastore_search")
        //     .catch(err => console.log(err));
        // SetAvailableList(response.data.items[0].carpark_data || []);
    }, [])

    //init Map
    const initMap = useCallback((des) => {
        setCurDestination(des);
        if (mapRef.current && mapsRef.current) {
            loadMapRoute(mapRef.current, mapsRef.current,
                new mapsRef.current.LatLng(startLocation.latitude, startLocation.longitude),
                curDestination ? curDestination.address : sortList[0].address
            )
        }
    }, [sortList, mapRef, mapsRef, startLocation, curDestination])
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
    const nearList = useCallback((end) => {
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
            // const current = trans97.getLocation(
            //     startLocation.latitude,
            //     startLocation.longitude
            // );
            // console.log('current', startLocation);
            let endLocation = end ? end : startLocation;
            // const dis = CoolWPDistance(v['x_coord'], v['y_coord'], endLocation.longitude, endLocation.latitude)
            // const pow_1 = Math.pow((v['x_coord'] - endLocation.latitude), 2)
            // const pow_2 = Math.pow((v['y_coord'] - endLocation.longitude), 2)
            // console.log(v, '12312312312312', endLocation)
            const dis = GetDistance(v['x_coord'], v['y_coord'], endLocation.latitude, endLocation.longitude)
            return {
                dis: dis,
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

        setSortList(value);
    }, [startLocation]);
    //get lat lng 
    const getLatLng = useCallback(async (address) => {
        // console.log(address)
        // if (!address) return;
        const id = await axios
            .get(`https://maps.googleapis.com/maps/api/geocode/json?address='${address}'&key=AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4`)
            .catch(err => console.log(err));
        console.log(id)
        // if (!id) return;
        const end = {
            address: id.data.results[0].formatted_address,
            latitude: id.data.results[0].geometry.location.lat,
            longitude: id.data.results[0].geometry.location.lng,
        }
        console.log(end, 'end')
        initMap();
        nearList(end);
    }, [nearList, initMap])
    // const auto = useCallback(async (e) => {
    //     await axios
    //         .get(`https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=${e}&key=AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4`)
    //         .catch(e => console.log(e))
    // mapsRef.current.Autocomplete(input);
    // console.log('--')
    // }, [])

    useEffect(() => {
        getLotAvailability();
        // var data = {
        //     resource_id: '139a3035-e624-4f56-b63f-89ae28d4ae4c', // the resource id
        //     limit: 5, // get 5 results
        //     q: 'jones' // query for 'jones'
        //   };
        //   $.ajax({
        //     url: 'https://data.gov.sg/api/action/datastore_search',
        //     data: data,
        //     dataType: 'jsonp',
        //     success: function(data) {
        //       alert('Total results found: ' + data.result.total)
        //     }
        //   });
        nearList();
        getCurrentLocation();
    }, [nearList, getCurrentLocation, getLotAvailability]);

    if (sortList === null) {
        return null
    }

    return (
        <section className="map-page" style={{ height: height }}>
            <div className='header'>
                <Input
                    id="locationTextField"
                    placeholder='Choose Ending Point'
                    onChange={(e) => { setEndLocation(e.target.value); console.log(e.target.value) }} />
                <Button
                    style={{
                        marginLeft: '15px',
                        background: '#1990ff',
                        color: 'white',
                        borderRadius: '10px',
                        border: 'none'
                    }}
                    onClick={() => getLatLng(endLocation)}
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
                        onClick={() => { }}
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

function getRad(d) {
    var PI = Math.PI;
    return d * PI / 180.0;
}
function CoolWPDistance(lng1, lat1, lng2, lat2) {
    var f = getRad((lat1 + lat2) / 2);
    var g = getRad((lat1 - lat2) / 2);
    var l = getRad((lng1 - lng2) / 2);
    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);
    var s, c, w, r, d, h1, h2;
    var a = 6378137.0;//The Radius of eath in meter.
    var fl = 1 / 298.257;
    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;
    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;
    w = Math.atan(Math.sqrt(s / c));
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;
    s = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    if (s >= 1000 && s <= 99000) {
        var kilometer = s / 1000;
        s = kilometer.toFixed(1) + 'km';
    } else if (s > 99000) {
        s = '>99km';
    } else {
        s = Math.round(s) + 'm';
    }
    // s = s/1000;
    // s = s.toFixed(2);//指定小数点后的位数。
    return s;
}

function GetDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;
}