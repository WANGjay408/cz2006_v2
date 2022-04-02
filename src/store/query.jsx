// import axios from 'axios';
import axios from 'axios';
import { carparkList } from './carparlList';

const list = carparkList.map(async (v) => {
    const cur = await axios
        .get(`https://maps.googleapis.com/maps/api/geocode/json?address='${v.address}'&key=AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4`)
        .catch(err => console.log(err));
    return {
        ...v,
        "x_coord": cur.data.results[0].geometry.location.lat,
        "y_coord": cur.data.results[0].geometry.location.lng
    }
})
// if (!id) return;


console.log(list)