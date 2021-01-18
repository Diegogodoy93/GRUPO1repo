//FUNCIONES: 

const Facebook = require("./lib/OauthFacebook");
const sqlFn = require("./lib/funcionesSql.js")
const JWT = require("./lib/funcionesJWT.js");
const Google = require("./lib/oAuthGoogle");
const validateCredentials = require("./lib/funcionesValidacion.js");



const GooglePlusTokenStrategy = require('passport-google-plus-token'); //=> Esto irá dentro de otro fichero
const router = require("express-promise-router")();	
// const validateEmail = require("./lib/funcionesValidacion.js");
// const validatePsw = require("./lib/funcionesValidacion.js")


//MODULES
const firebase = require('firebase');
const express = require("express");
const server = express();

const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const base64 = require("base-64");
const crypto = require("crypto");
const listenPort = 5678;
const sql = require("mysql");
require("dotenv").config();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const facebook = new Facebook();
const publicFiles = express.static("public");






//https://grupo1-2e651-default-rtdb.europe-west1.firebasedatabase.app/
//////////////FIREBASE CHAT CONFIG QUE PROBABLEMENTE ACABARÁ YENDO DENTRO DEL .ENV //////////////


var firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
  };

 // Initialize Firebase
 firebase.initializeApp(firebaseConfig);
var dataBase = firebase.database();

//CONFIG SQL
let connection = sql.createConnection({

	"host"     : process.env.HOST_SQL,
	"user"     : process.env.USER_SQL,
	"password" : process.env.PASSWORD_SQL, 
	"database" : process.env.DATABASE_SQL,
	"multipleStatements" : true  //Support for multiple statements is disabled for security reasons (it allows for SQL injection attacks if values are not properly escaped).
});


 
const options = {

	"maxAge": 1000 * 60 * 15 * 4 * 24 * 15, // would expire after 15 days		////// OPTIONS DE JWT//////
	"httpOnly": true, // The cookie only accessible by the web server
	"signed": true // Indicates if the cookie should be signed
};
 

server.use(publicFiles);
server.use(bodyParser.urlencoded({"extended":false}));
server.use(cors({
    origin:"http://localhost:3000", 
    credentials:true,
}));
server.use(bodyParser.json());
server.use(express.static("./../public"));

////FUNCIONES MAPA//////




const calcDistance = (lat1, lon1, lat2, lon2) => {

	const R = 6371e3; // metres
	const φ1 = lat1 * Math.PI/180; // φ, λ in radians
	const φ2 = lat2 * Math.PI/180;
	const Δφ = (lat2-lat1) * Math.PI/180;
	const Δλ = (lon2-lon1) * Math.PI/180;

	const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	const d = R * c; // in metres
  return d
  
}

//END-POINTS DE PRUEBA

///////////////////////////////////////////////

server.get("/prueba", (req, res) => {

	

})







server.post("/register", (req, res) => { /////FUNCIONA (Falta comprobar registro con Google/Facebook)  PERO Esto se puede refactorizar y optimizar/////
	//Variables para la primera query a SQL
	let sql;
	let arrayVariables;
	let firstVal; //=> Variable para comprobación de formato de contraseña e email.
	if(req.body){
		
		
		
		//Apic será null si el usuario ha puesto que no es apicultor o será un objeto que contendrá tanto numRegGanadero como tipoOrg 
		const {idGoogle, idFacebook, name, familyName, email, password, apic, tipoOrganizacion, codigoAsentamiento} = req.body;
		
		if(!email || !name || !familyName) {
			return res.send({"res":"-2", "msg": "no required data"})
		}
		
		//Tenemos que volver a comprobar si el objeto enviado desde front contiene datos válidos para nuestra web

 
			if(apic){

				if(tipoOrganizacion && codigoAsentamiento) {
					
					sql = `INSERT INTO users (created_at, name, family_name, Email, apicultor) VALUES (?,?,?,?,?);`;
					arrayVariables = [new Date(),name, familyName, email, 1]
				} else {
					return res.send({"res":"-3", "msg": "no required data"})
				}


			} else {

				sql = `INSERT INTO users (created_at, name, family_name, Email) VALUES (?,?,?,?);`
				arrayVariables =[new Date(),name, familyName, email]
			}		
		

		if(password && email) {
			
			firstVal = validateCredentials(password ,email ); //LO QUE ESTÁ PASANDO AQUÍ ES UNA PUTA LOCURA, SE SUPONE QUE EMAIL ENTRA PRIMERO COMO PARÁMETRO. EN CODEPEN SALE TRUE SOLO SI ES ASÍ. EN CAMBIO EN NODE SOLO SALE TRUE SI ENTRA PRIMERO EL PASSWORD. LO CUAL NO TIENE SENTIDO ALGUNO.
			
			

			if (!firstVal) {
				return res.send({"res1":"0", "msg": "Wrong format in firstVal"})
			}

		}
		connection.query(`SELECT * FROM users WHERE Email = ?;`,[email], function (err, result) {
			
			if(err) {
				
				return res.send({"res0" : "0", "msg" : err});
			}

			if(result.length) {
				console.log("Estás aquí", result.length, result[0])
				return res.send({"res-2" : "0", "msg" : "Email ya utilizado"});
			}
			
			connection.query(sql, arrayVariables, (err, result) => {
				
				if(err) {
					
					return res.send({"res2" : "0", "msg" : err});
				}
	
				
	
				let idUser = result.insertId;
				
	
				if (apic) {
	
					
					const sql = `INSERT INTO apicultores (id_users, codigo_asentamiento, tipo_org) VALUES (?,?,?)`
	
					connection.query(sql, [idUser, codigoAsentamiento, tipoOrganizacion], (err, result) => {
						
						if(err) {
							
							return	res.send({"res3" : "0", "msg" : err});
						}
						
						
					})
	
				}
	
				const Payload = {
					"userId" : idUser,
					"email" : email,
					"name" : name,
					"iat" : new Date()
				};
				//PUSH INFO PARA LOS USUARIOS DE REGISTRADOS DESDE NUESTRA APP
				if (password) {
	
					const Validated = validateCredentials(password,email) // MIRAR ARRIBA CON LA PRIMERA CONPROBACIÓN PARA VER QUÉ PASA.
					
					if(Validated){
	
						let pswObject = JWT.encryptPassword(password);
	
						const sql = `INSERT INTO coolmenaUsers (id_users, passw, SALT) VALUES (?,?,?)`;
	
						
						
						
						connection.query(sql, [idUser, pswObject.password, pswObject.salt], (err, result) => {
	
							if(err) {
								return	res.send({"res4" : "0", "msg" : err});
							}
	
							
							connection.end();
	
							return res.cookie("jwt", JWT.generateJWT(Payload),{"httpOnly" : true}).send({"res": "2", "msg": `user signed up with coolmena users`});
							
	
	
						})
	
					} else {
						
						
						return res.send({"res":"0", "msg": "Wrong format"})
						
						
					}
					//PUSH INFO PARA LOS DE GOOGLE
				} else if (idGoogle) {


	
					const sql = `INSERT INTO googleUsers (id_users, id_google) VALUES (?,?)`
					
					connection.query(sql, [idUser, idGoogle], (err, result)=> {
						
						if(err) {
							return	res.send({"res6" : "0", "msg" : err});
						}
	
						 connection.end();
	
						return res.cookie("jwt", JWT.generateJWT(Payload),{"httpOnly" : true}).send({"res": "2", "msg": Payload});
						
					})
					//PUSH INFO PARA LOS DE FACEBOOK 
				} else if (idFacebook) {
	
					const sql = `INSERT INTO facebookUsers (id_users, id_facebook) VALUES (?,?)`
					
					connection.query(sql, [idUser, idFacebook], (err, result)=> {

						
						
						if(err) {
							return	res.send({"res7" : "0", "msg" : err});
						}
	
						 connection.end();
						return res.cookie("jwt", JWT.generateJWT(Payload),{"httpOnly" : true}).send({"res": "2", "msg": Payload});
						
					})
				} else {
					
					return	res.send({"res" : "0", "msg" : "No data"})
				}
							
			})

		})	
		
	} else {
		
		res.send({"res" : "0", "msg": "No body"})
	};
});

//////  LOGIN ENDPOINT ESTÁ CORREGIDO FALTA COMPROBACIÓN //////////
//ESTÁ LA OPCIÓN DE ADMIN PARA ACCEDER <=====
server.post("/login", (req, res) => {
	
	const {email, password} = req.body; //VARIABLE QUE CONTIENE EL JSON LOS DATOS ENCRIPTADOS DEL FRONT.
	

		const Validated = validateCredentials(password, email);
    
		//////////AQUÍ TENDRÍA QUE IR LA PARTE DE VERIFY PASSWORD O PODEMOS HACERLO CON BCRYPT => LINEA 123 DE https://github.com/TheBridge-FullStackDeveloper/ft-sep20-Backend-examples/blob/main/jwt/server.js////////////
		if (email && password && Validated){

		const sql = `SELECT * from users U INNER JOIN coolmenaUsers CU ON U.id = CU.id_users WHERE email =?;`
		
		connection.query(sql,[email], function (err, result) {
			
			if(err) {
				return	res.send({"res" : "0", "msg" : err});
			}
			// connection.end(); <======== 
			let realPsw = {

				password: result[0].passw,
				salt: result[0].SALT 
			}
			
			
			
			
			//Aquí se tiene que comparar el psw en DB con la contraseña salted que nos llega 
			if (JWT.verifyPassword(password,realPsw)) { //El password que queremos comprobar es el queryResult.password
				
				const Payload = {

					// "userName": userName,
					// "iat": new Date(),
					// "role": "User",
					// "ip": req.connection.remoteAddress
					"userId" : result[0].id,
					"email" : email,
					"name" : result[0].name,
					"iat" : new Date()
				};
				
				return res.cookie("jwt", JWT.generateJWT(Payload),{"httpOnly" : true}).send({"res": "2", "msg": Payload}); 
				
				
			}  else {
				
				return res.send({"res": "0", "msg": "Wrong user or password"});
			}
			
			
			
			
		});
	} else {res.send({"res" : "0", "msg": "Wrong format"});}


});




server.get("/facebook-redirect", (req,res) =>{

    res.redirect(facebook.getRedirectUrl());
});


server.get("/facebook-login", async (req, res) => {

    const Token = await (facebook.getOauthToken(req.query.code, req.query.state));
    const data = await facebook.getUserInfo(Token, ["name", "email"])
    
    const {id, name, email} = data;

    console.log(data);

    if(id && name && email){

        let Validated = validateEmail(email);

        if(Validated){
            const DBconnection = sqlFn.connectionDB();
            if (DBconnection){
                const prom = new Promise((resolve, reject) => {
                    DBconnection.connect(err => {
                        if (err) {
                            reject(err);
                        }
                        resolve();
                    });
                });
                prom.then(() => {
                    const sql = "SELECT * FROM users U INNER JOIN facebookUsers FU ON FU.facebook_id = U.id WHERE email = ? OR idFacebook = ?"; //Select siempre devuelve un array, y cuidado con el like, si hay un correo que lo contiene te entran
                    connection.query(sql, [email, id], (err, result) => {

                        if (err){
                            return res.send({"res" : "0", "msg" : err})
                        } else if (result.length){

                                //Generate JWT
                                const Payload = {
                                    "userId" : result[0].id,
                                    "name" : result[0].name,
                                    "email" : result[0].email,
                                    "iat" : new Date()
                                };

                                //COMPLETAR con resto de datos pedidos

                                const jwt = JWT.generateJWT(Payload);
                                const jwtVerified = JWT.verifyJWT(jwt);

                                if(jwtVerified){

                                    //Access as administrator
                                	res.cookie("JWT", jwt, {"httpOnly" : true})
                                    	.send({"res" : "1", "msg" : `${result[0].name} has been found in usersFacebook and logged in with facebook`});

                                } else {

									//posiblemente aquí queremos además borrar el jwt que tiene el front
                                    return res.send({"res" : "0", "msg" : "JWT not verified"})
                                }		
                                
                            
                        } else {
							//Aquí se tiene que mandar la respuesta que requiera front si necesitamos mas datos de los que nos da facebook
							//mandamos además el objeto obtenido del oAuth para que se vuelva a mandar al end-point formApic
                            return res.send({"res" : "2", "msg" : "User facebook to fill formApic", data});

                        }
                        connection.end();
                    });
                })
                prom.catch(e => res.send({"res" : "0", "msg" : "Unable to connect to database", e}));
            }

        } else {

            return res.send({"res" : "0", "msg" : "Error in credentials"})
        }
    } else {
        res.send({"res" : "0", "msg" : "Left credentials"})
    }
});




server.get("/google-redirect", (req, res) => {
	res.redirect(Google.getGoogleAuthURL());
});

server.get("/google-login", async (req, res) => {

    const {code} = req.query;
    
	if (code) {
        const userData = await Google.getGoogleUser(code);

        if(userData){
            // res.send(userData);
            const {id, email, name} = userData;
            const Validated = validateEmail(email);

            if(Validated){
                const DBconnection = sqlFn.connectionDB();
                if (DBconnection){
                    const prom = new Promise((resolve, reject) => {
                        DBconnection.connect(err => {
                            if (err) {
                                reject(err);
                            }
                            resolve();
                        });
                    });
                    prom.then(() => {
                       
                        const sql = "SELECT * FROM users U INNER JOIN googleUsers GU ON GU.google_id = U.id WHERE email = ?";
                        DBconnection.query(sql, [email], (err, result) => {

                            if (err){
                                return res.send({"res" : "0", "msg" : err})
                            } else if (result.length){


                                //Generate JWT
                                const Payload = {
                                    "userId" : result[0].id,
                                    "name" : result[0].name,
                                    "email" : result[0].email,
                                    "iat" : new Date()
                                };

                                const jwt = JWT.generateJWT(Payload);
                                const jwtVerified = JWT.verifyJWT(jwt);

                                if(jwtVerified){

                                    
									res.cookie("JWT", jwt, {"httpOnly" : true})
										//{"res" : "1", "msg" : `${result[0].name} has been found in DB and logged in with google`}
										//TENEMOS QUE METER EL END-POINT DE HOME O  A DONDE QUERAMOS IR. 
										.redirect('http://localhost:3000/------------------');

                                } else {
									//Aquí posiblemente borremos el JWT que tiene front 
                                    return res.send({"res" : "0", "msg" : "JWT not verified"})
                                }
                                    
                            } else {

								//respuesta que damos a front para que mande al usuario al end-point del form completo.
                                return res.send({"res" : "2", "msg" : "User Google to fill form", userData})
                            }
                            DBconnection.end();
                        });
                    })
                    .catch((e) => {
                        
                        return res.send({"res" : "0", "msg" : "Unable to connect to database", e});
                    });
                }
            }

        } else {
            return res.send({"res" : "0", "msg" : "No userData"});
        }

	} else {
        res.send({"res" : "0", "msg" : "No code"})
    }
});





//LOGOUT
server.get("/logout", (req, res) =>{
	
	res.clearCookie(JWT);
	res.redirect("http://localhost:5678");
	
});


//////////////////////////PARTE DE CONFIGURACIÓN DE CUENTA DE FRONT(PARTE NEGRA ABAJO)/////////////////





//////////////////////////ENDPOINT CAMBIAR CONTRASEÑA///////////////////////////////////
//
//
//
//
//
////////////////////////////

////////////////OBTENCIÓN DE TODOS LOS PRODUCTOS ---CARTA3/3A/3D--- ///////////////////
///////////////ENDPOINT PARA ORDENACIÓN DE PRODUCTOS DEPENDIENDO DE LA DISTANCIA CON RESPECTO A LA POSICIÓN DEL USUARIO//////////
server.get("/products", (req, res) => {  //Puede que haya que cambiar este endpoint puesto que necesitamos también long/lat

	


	try {connection.query(`SELECT * FROM products;`,  (err, result) =>  {

		const orderedProductList = [];
		const unOrderedProductList = result;
		const userPosition = req.body; //Front mandará un objeto compuesto de lat y lon 
			
		if (err){
			return res.send({"res" : "0", "msg" : err})
		}
		

		if(userPosition){
				
			result.map((elemento) => {

				let formatedCoord = elemento.long_lat.split(",");
				let productLat = formatedCoord[0] * 1;
				let productLon = formatedCoord[1] * 1;
	
				if (calcDistance(userPosition.lat, userPosition.lng, productLat, productLon) <= 100000) {
					
					orderedProductList.push(elemento);
				}	
			})


			connection.end();
			return res.send({"res": "2", "msg": {orderedProductList,unOrderedProductList}});
		} else {
				
			connection.end();
			res.send({"res": "1", "msg": unOrderedProductList})
		}
	})} catch {
		return res.send({"res": "-2", "msg": "CATCH"})
	}

	 	
})

/////////////OBTENCIÓN DE PRODUCTOS DE UN ID_USUARIO EN PARTICULAR (DE UN USUARIO APICULTOR) ---CARTA 2D/2A---  /////////////////

server.get("/productsByUserId/:ID", (req, res) => {

	let userID = req.params.ID 

	connection.query(`SELECT * FROM products WHERE id_users = ?;`,[userID], (err, result) => {

		if (err){
			return res.send({"res" : "0", "msg" : err})
		}

		connection.end();
		res.send({"res": "2", "msg": result});
		
	})
})


/////////OBTENCIÓN DE PUNTOS DE VENTA PARA POSTERIOR ORDENACIÓN  LINEA VERDE Y NARANJA (CENTRO)  ////////////////
server.post("/sellingPoints", (req, res) => {
	
	let orderedList = [];
	let unOrderedList;
	const userPosition = req.body //Front enviará un objeto con las llaves lat y lng (como en el endpoint de arriba)
	const sql = `SELECT * FROM users_selling_points;`
	
	connection.query(sql, (err, result) => {
		
		if (err){
			return res.send({"res" : "0", "msg" : err})
		}
			
		if(userPosition){

			unOrderedList = result;	
			result.map((elemento) => {

				let formatedCoord = elemento.long_lat.split(",");
				let Lat = formatedCoord[0] * 1;
				let Lon = formatedCoord[1] * 1;
	
				if (calcDistance(userPosition.lat * 1, userPosition.lng * 1, Lat, Lon) <= 10000) {
					
					orderedList.push(elemento);
					
				}	
			})


			
			return res.send({"res": "2", "msg": {orderedList,unOrderedList}});
		} else {
				
			
			res.send({"res": "1", "msg": unOrderedList})
		}

	})
	
})


// server.get("/sellingPoints/:userLat/:userLon", (req, res) => {

// 	connection.query("SELECT * FROM products_selling_points;", function (err, result) {
// 		///////////////////RECIBIMOS TANTO COORDENADAS COMO ID DE APICULTOR, POSIBLEMENTE UTILICEMOS ESTO PARA MOSTRAR ALGO DE INFO EN CADA UNO DE LOS PUNTOS QUE APARECEN DENTRO DEL MAPA/////////////////
// 		/////////////////EN LA BASE DE DATOS LOS DATOS DE COORDENADAS VIENEN EN FORMATO: "40.421562099999996,-3.6927109999999996"  POR EJEMPLO, SIEMPRE CON EN ORDEN LAT,LONG Y EN FORMA DE STRING /////////////
// 		if (err) {

// 			console.log(err);
// 			return;
// 		}

// 		/////////////////////funcion coordenadas ////////////////
// 		let userLat = req.params.userLat * 1;
// 		let userLon = req.params.userLon * 1;
// 		let sellingPoints = result;
// 		let arrayUsersInRange = [];

		
// 		sellingPoints.map((elemento) => {

// 			let formatedCoord = elemento.long_lat.split(",");
// 			let apicLat = formatedCoord[0] * 1;
// 			let apicLon = formatedCoord[1] * 1;

// 			if (calcDistance(userLat, userLon, apicLat, apicLon) <= 5000) {

// 				arrayUsersInRange.push(elemento);
// 			}



// 		})
// 		connection.end();
// 		res.send(arrayUsersInRange);

// 	})	
// })




//ENDPOINT id- APICULTORES JUNTO CON SU LONG/LAT (users_selling_points)=> POR HACER ---CARTA2D ???? COMPRENDO QUE ESTO ES PARA LA CARTA2---
// server.get("/usersApicCoord", (req, res) => {

// 	connection.query("SELECT * FROM users_selling_points;", (err, result) => {

// 		if (err){
// 			res.send({"res" : "0", "msg" : err})
// 		}

// 		connection.end();
// 		res.send(result);

// 	})
// })


//ENDPOINT DE INFORMACION DE APICULTOR JUNTO CON SU LONG/LAT (users_selling_points)=> POR HACER ---CARTA2D---	 HACEMOS UN JOIN PARA EVITAR TENER QUE HACER MÁS DE UNA QUERY, HACEMOS JOIN DE TABLA users y tabla users_selling_points a partir del users_id para obtener tanto la info del apicultor como sus coordenadas 
//END-POINT PARA PARTE MORADA/NEGRA DE ABAJO//////////////////																									//LA QUERY PRETENDE SACAR DE LA TABLA USERS TANTO EMAIL COMO FECHA DE CREACIÓN DEL USUARIO HACIENDO UN JOIN CON LA TABLA USERS_SELLING POINTS A PARTIR DE LAS COINCIDENCIA DE ID DONDE EL ID SEA = A LA QUERY

server.get("/usersApicInfoByID/:ID", (req, res) => {


	let query = req.params.ID
	connection.query(`SELECT users.user_name, products.id, products.product_name, products.product_type, products.picture, products.rating, selling_points.location FROM users JOIN apicultores ON users.id = apicultores.id_users JOIN products ON apicultores.id_apicultor = products.id_apicultor JOIN selling_points ON selling_points.id_apicultor = apicultores.id_apicultor WHERE users.id = ?`,[query], (err, result) => {

		if (err){
			return res.send({"res" : "0", "msg" : err})
		}

		connection.end();
		return res.send({"res": "1", "msg" :result});

	})
})



//ENDPOINT DE PRODUCTOS FAVORITOS DEL CONSUMIDOR/APICULTOR => SE OBTIENEN LOS PRODUCTOS FAVORITOS DEL USUARIO QUE LO ESTÁ UTILIZANDO---CARTA5/2D--- 

server.get("/productsFav", (req, res) => {

	const { usrid } = JWT.getJWTInfo(req.cookies.JWT)

	if(usrid && JWT.verifyJWT(req.cookies.JWT)){
		
		

		connection.query(`SELECT * FROM users_products_fav WHERE id_users = ?;`, [usrid], (err, result) => {

			if (err){
				return res.send({"res" : "0", "msg" : err})
			}

			connection.end();
			return res.send({"res" : "1", "msg": result});
	
		})
	} else {res.send({"res": "0", "msg": "No JWT"})}
	
})

 

/////////////////ENDPOINTS DEL CHAT//////////////////
///////////////RECIBIR ID DE USUARIO//////////////////NO ESTOY SEGURO SI VAMOS A NECESITAR ESTE ENDPOINT/
server.get("/getUserId/:userName", (req, res) => {

	let userName = req.params.userName;  //POSIBLEMENTE METAMOS AQUÍ DISTINTOS PARAMS PARA OBTENER ID USER CON TODOS LOS PARAMS METIDOS <=
	
	connection.query(`SELECT id from users WHERE user_name =?;`, [userName], (err, result) => {
		
		if (err){
			return res.send({"res" : "0", "msg" : err})
		}
		
		connection.end();
		res.send({"res": "1", "msg" : result[0].id})
	})
})

////////////////CORREGIDO FALTA COMPROBACIÓN///////////////////////
///////////////RECIBIR CONVERSACIÓN DE USUARIO CON OTRO USUARIO EN PARTICULAR////////////////////
server.get("/getChat/:userId2", (req, res) => {

	
	const userId2 = req.params.userId2;

	const { userId } = JWT.getJWTInfo(req.cookies.JWT);
	
	if (usrid && JWT.verifyJWT(req.cookies.JWT)) {	
		
		connection.query(`SELECT id_chats from chats_users WHERE id_users = ? OR id_users = ?;`, [userId, userId2], (err, result) => {
		
			if (err){
				return res.send({"res" : "0", "msg" : err})
			}


			const idArray = sqlFn.sqlArrayMap(result, "id_chats");


			let fireBaseQuery = sqlFn.findDuplicates(idArray);

			if(fireBaseQuery.length){
			
				dataBase.ref(`idChats/${fireBaseQuery[0]}`).once("value", (snapshot) => {

					const content = snapshot.val();
					const messages = content.messages;
			
					connection.end();
					return res.send({"res": "1", "msg" : messages});

				})

			} else {res.send({"res": "0", "msg": "No data found"})}

		

		})
	} else {res.send({"res": "0", "msg": "No JWT"})}

	
})
///////////////CORREGIDO FALTA COMPROBACIÓN////////////////
///////////////INSERTAR NUEVO MENSAJE EN CHAT/////////////

server.post("/newChatMessage", (req, res) => {
	
	const { userId } = JWT.getJWTInfo(req.cookies.JWT);
	if (usrid && JWT.verifyJWT(req.cookies.JWT)) {
		
		//recibimos JSON desde front un JSON con:  Id de usuario que hace el envío del mensaje como id del chat que existe con la persona a la que quiere enviar el mensaje
		let idChat = req.body.chatId;
		let message = req.body.message;
		let timeNow = Date.now();
	
		let newMessage = {

			time: timeNow 
		
		}

	
		//creamos una nueva llave con el idUser dentro del objeto newMessage que es igual al mensaje que recibimos desde front 
		newMessage[userId] = message;

		dataBase.ref(`idChats/${idChat}/messages`).push(newMessage);
		dataBase.ref(`idChats/${idChat}/lastActivity`.set(timeNow));

	 
	
	
		connection.query(`INSERT INTO chats (id, created_at) VALUES (?, ?);`, [idChat, timeNow], (err, result) => {

			if (err){
				return res.send({"res" : "0", "msg" : err})
			}

			connection.end()
		})

	} else {res.send({"res": "0", "msg": "No JWT"})}



})
// SE PUEDE OBTIMIZAR Y HAY QUE COMPROBAR//////////////
///////////CREAR NUEVO CHAT///////////////////
server.post("/newChat", (req, res) => {

	const { userId } = JWT.getJWTInfo(req.cookies.JWT);
	
	const userId2 = req.body.userId2;

	if(userId && userId2 && JWT.verifyJWT(req.cookies.JWT)) {
		
		connection.query("SELECT * FROM chats_users WHERE id_user = ?;", [userId], (err, result1) => {
			
			if (err){
				return res.send({"res" : "0", "msg" : err})
			}
	
			//Flag que se activa si se encuentra una coincidencia de id_chats entre dos usuarios
			let flag = false;	
			//creamos un array con los id_chat a partir del array que hemos recibido
			let arrayChatId1 = sqlFn.sqlArrayMap(result1, "id_chats");
	
			
			
			//si existen datos dentro del array recibido como parámetro:
			if (result1.length){
				connection.query("SELECT * FROM chats_users WHERE id_user = ?;", [userId2], (err, result2) => {
	
					if (err){
						return res.send({"res" : "0", "msg" : err})
					}
	
				
				//creamos el segundo array con los id_chat recibidos de la segunda petición a SQL
				let arrayChatId2 = sqlFn.sqlArrayMap(result2, "id_chats");
				
				//Por cada uno de los elementos dentro del primer array, verificamos si existe algún elemento dentro del segundo array que coincida
				arrayChatId1.map((element) => {
	
					arrayChatId2.map((element2) => {
	
						if (element === element2) return flag = true;
	
					})				 
				})
				
	
				//como el flag no se ha levantado puesto que no se ha encontrado un id_Chats común => creamos nuevo objeto dentro de Firebase
				if (!flag) {
					
					//objeto que se meterá dentro de FireBase y contendrá toda la información del chat entre dos usuarios
					let timeNow = Date.now();
					let randomId = `${Math.floor(Math.random() * 1000000000000)}`;  // Número random de 12 cifras que hará de id único en FireBase
					let newChat = {
						createdDate : timeNow,
						usersInside : [`${userId}`, `${userId2}` ],
						lastActivity : timeNow,
						messages : {
						   
						}
					}
	
					 //Empujamos el nuevo objeto dentro de FireBase
	
					dataBase.ref(`idChats/${randomId}`).set(newChat);
					
					
					
					
					
					//NO HAS HENDLED SI HAY ERRORES EN ESTAS QUERIES //
					//Actualizamos todas las tablas de SQL que tienen que ser actualizadas
					connection.query(`INSERT INTO chats_users (id_chats, id_users) VALUES (?, ?);`, [randomId, userId], (err, result) => {
						
						if (err){
							return res.send({"res" : "0", "msg" : err})
						}
						connection.query(`INSERT INTO chats_users (id_chats, id_users) VALUES (?, ?);`, [randomId, userId2], (err, result ) => {
	
							if (err){
								return res.send({"res" : "0", "msg" : err})
							}
	
							connection.query(`INSERT INTO chats (id, created_at, last_activity) VALUES (?, ?, ?);`, [randomId, timeNow, timeNow], (err, result) => {
	
								if (err){
									return res.send({"res" : "0", "msg" : err})
								}
	
								connection.end();
								
							})
						})
					})
					
					
	
					
	
				} else {
					connection.end();
					return res.send({"res": "0", "msg": "There's already a Chat created between these users"})
				}
	
				
				
				
			})}
			
		
		})
	} else {res.send({"res": "0", "msg": "No JWT"})}
})
//Para obtener datos del propie user que está haciendo la petición. Se envían a front los resultados tal cual llegan desde SQL.
//Esto tiene que cambiar de end-point
server.get('/get', (req, res) => {
	if (req.cookies.JWT){

		const {userId} = JWT.getJWTInfo(req.cookies.JWT);
		if(JWT.verifyJWT(req.cookies.JWT)) {
			
			connection.query(`SELECT FROM users (name, family_name, birthday, tel, email) WHERE id = ?;`, userId, (err, result ) => {
	
				if (err){
					return res.send({"res" : "0", "msg" : err})
				}	
				if (result.length){
	
	
					return res.send({"res" : "0", "msg" : err})
	
				} else return res.send({"res" : "0", "msg" : err})	
			})
		} else return res.send({"res": "0", "msg": "Not verified JWT. Sign in"})
		
	} else return res.send({"res": "0", "msg": "No JWT"})

})





//////////////////QUERY QUE TENEMOS QUE PROBAR PARA OPTIMIZAR/////////////////////
//SELECT id_chats FROM chats_users WHERE id_users = ${idUser2} AND id_chats IN(SELECT id_chats FROM chats_users WHERE id_users == ${idUser1})


server.listen(listenPort, () => {
	console.log(`http://localhost:5678/ server listening on port ${listenPort}`);
});






