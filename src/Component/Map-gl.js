
import * as React from 'react';
import { useState,useEffect } from 'react';
import ReactMapGL, {GeolocateControl, Marker, Popup} from 'react-map-gl';
import RoomIcon from '@material-ui/icons/Room';
import { red } from '@material-ui/core/colors';
import InfoFile from './InfoFile';
import './style.css'
import { Room, Star, Cancel, Place } from "@material-ui/icons"
import makeid from '../Component/help/function'
import firebase from 'firebase'
import { storage, fireDB } from './firebase';
import useStyles  from '../Component/styles'
import { Paper, Typography } from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import LocationOnOutLineIcon from '@material-ui/icons/LocationOnOutlined'
import Rating from '@material-ui/lab/Rating'
import { CssBaseline, Grid } from '@material-ui/core'
import Header from '../Component/header/header'
import List from '../Component/list/list' 


const geolocateControlStyle= {
  right: 10,
  top: 10
};

function Map() {
  const [viewport, setViewport] = useState({
    width: "100%",
    height: "100%",
    latitude:32.05731492215807,
    longitude: 34.780587354714925,
    zoom:18
  });
  const [showPopup, togglePopup] = React.useState(false);
  const [newPlace,setNewPlace] = useState("")
  const [rating, setRating] = useState(0)
  const [fileName, setFileName] = useState("")
  const [title, setTitle] = useState(null)
  const [address, setAddress] = useState(null)
  const [phone, setPhone] = useState(null)
  const [desc, setDesc] = useState(null)
  const [places, setPlaces] = useState([])
  const isDesktop = useMediaQuery('(min-width:600px)')
  const classes = useStyles()
  const latClick=(e)=>{
    console.log(e)
    const [long, lat] = e.lngLat
    setNewPlace({
      lat: lat,
      long: long
    })

  }



  const onChangeFile = e => {
    setFileName(e.target.files[0])

   
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileName) {
      const imageName = makeid(10)
      const uploadTask = storage.ref(`images/${imageName}.jpg`)
          .put(fileName)

      uploadTask.on("state_change", (snapshot) => {

          
      }, (error) => {
          alert(error)

      }, () => {
          /////get Image Url
          storage.ref("images").child(`${imageName}.jpg`)
              .getDownloadURL()

              .then((imageUrl) => {
                  fireDB.collection("AddNewPlace").add({
                      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                      photoUrl: imageUrl,
                      address:address,
                      lat:Number( newPlace.lat),
                      long:Number( newPlace.long),
                      phone:phone,
                      rating:rating,
                      desc:desc,
                      title:title
                      
                  })
          
                  
                  setNewPlace(null)
                
              })

      })
  }
  
   
  }

  useEffect(() => {
    fireDB.collection("AddNewPlace")
    .onSnapshot((snap) => {
        let documents = [];
        snap.forEach(doc => {
            console.log(doc.data())
            documents.push({ ...doc.data(), id: doc.id })
        });
        setPlaces(documents)
    })
       
}, [])
  
  return (
    <>
    <CssBaseline/>
    <Header/>
    <Grid container spacing={3} style={{ width: "100%" }}>
        <Grid item xs={12} md={4}>
          <List  places={places} />
        </Grid>
        <Grid item xs={12} md={8}>
        <ReactMapGL
      {...viewport}
      mapboxApiAccessToken="pk.eyJ1IjoiZWxoYWQiLCJhIjoiY2tzNml0NzFmMTNucDJ2cGh4bWQ5YndtNiJ9.RWDtw6EM9BQ1Q-KTID_q9A"
      mapStyle="mapbox://styles/elhad/ckshtr4pe24zr17s30kruj00h"
      onViewportChange={nextViewport => setViewport(nextViewport)
      }
      onDblClick={latClick}
      
    >
           {places.map(p => (
           <div key={p._id}>

            <Marker latitude={ p.lat} longitude={p.long} offsetLeft={-viewport.zoom * .7} offsetTop={-viewport.zoom * 2} className={classes.markerContainer}
               >
              
              {!isDesktop ? (
                <LocationOnOutLineIcon color="primary" fontSize="large" className={classes.pointer} />
              ) :
                <Paper elevation={3} className={classes.paper}>
                  <Typography className={classes.Typography} variant="subtitle2" gutterBottom>
                    {p.title}
                  </Typography>
                  <img src={p.photoUrl} alt={p.title} className={classes.pointer}
                  style={{width:"70px",objectFit:"cover"}}
                  
                
                  />
                </Paper>
              }

            </Marker>
            
          </div>
        ))}
       {showPopup && <Popup
          latitude={32.0584}
          longitude={34.7793}
          closeButton={true}
          closeOnClick={false}
          onClose={() => togglePopup(false)}
          anchor="top" >
          <div>
            <InfoFile/>
          </div>
        </Popup>}

      
      
        {newPlace && (

<Popup
  latitude={newPlace.lat}
  longitude={newPlace.long}
  closeButton={true}
  closeOnClick={false}
  onClose={() => setNewPlace(null)}
  anchor="left">
  <div>
    <form onSubmit={handleSubmit} enctype="multipart/form-data">
      <div>
        <label htmlFor="file">Choose Image</label>
        <input type="file" filename="imageUrl" onChange={onChangeFile} />
      </div>
      <label>Title</label>
      <input type="text" placeholder="Enter a place name" onChange={(e) => setTitle(e.target.value)} />
      <label>Address</label>
      <input type="text" placeholder="Enter a address" onChange={(e) => setAddress(e.target.value)} />
      <label>Phone</label>
      <input type="text" placeholder="Enter palce phone number" onChange={(e) => setPhone(e.target.value)} />
      <label>Review</label>
      <textarea placeholder="say something abute this place" onChange={(e) => setDesc(e.target.value)} />
      <label>Rating</label>
      <select onChange={(e) => setRating(e.target.value)}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button type="submit" className='submitButton'>Add Pin</button>
    </form>
  </div>
</Popup>

)}

    </ReactMapGL>

        </Grid>
      </Grid>
   

    
   </> 
  );
 
}
export default Map