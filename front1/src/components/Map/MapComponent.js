import React, { Component } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import './MapComponent.css'
import location from '../../assets/Location.png'

export class MapComponent extends Component {

    state = {
        loading: false,
        mapCenter: {
            lat:40.416775, 
            lng:-3.703790
        },
        objectsCreated:[],
        zoom: 13
    }

    icon = L.icon({
        iconUrl: location,
        
        iconSize:     [17, 20], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76]
      });     

      async componentDidMount  () {
       
        navigator.geolocation.getCurrentPosition((position) => {
                      
            fetch("http://localhost:5678/sellingPoints", {
                method: "POST",
                headers: {"Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'
            },  body: JSON.stringify({lat: position.coords.latitude, lng: position.coords.longitude}) 
            
        }).then(res => res.json()).then((data) => {
                     
            //Creación de los objetos que representan los puntos de venta. Se guardan dentro del state. Todo lo que tiene que ver con diseño de los Markers se encuentra dentro de icon.
            if(data.msg.orderedList) {
                let objects = []
                data.msg.orderedList.map((elemento) => {
                                     
                  return objects.push(
                        {
                            apicId: elemento.id_apicultor,
                            location: elemento.location,
                            position: {
                                lat: elemento.long_lat.split(",")[0] * 1,
                                lng: elemento.long_lat.split(",")[1] * 1,
                                
                            }
                        }
                )
                }) 
                    
                    this.setState({objectsCreated: objects, mapCenter:{lat: position.coords.latitude, lng: position.coords.longitude}, loading: true, zoom: 13});
                    console.log(this.state)                   
            }
        })
        })

      } 
           
    render() {
        
        
        const markerArray = this.state.objectsCreated;

        
        if (!this.state.loading) {
            return (
                
                    <MapContainer className="map" center={this.state.mapCenter} zoom={this.state.zoom}>
                    <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    </MapContainer>                   
                
            )
        } else {
            return (
                

                <MapContainer className="map" center={this.state.mapCenter} zoom={this.state.zoom}>
                <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markerArray.map((elemento) => {
                    console.log(typeof elemento.position.lat)
                    
                    return <Marker key={elemento.apicId} position={[elemento.position.lat, elemento.position.lng ]} icon={this.icon}></Marker>
                })}
                
                </MapContainer>
                
            
        )

        }
    }
}

export default MapComponent
