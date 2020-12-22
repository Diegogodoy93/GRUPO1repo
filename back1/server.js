//FUNCIONES: 

const Facebook = require("./lib/OauthFacebook");
const sqlFn = require("./lib/funcionesSql.js")
const JWT = require("./lib/funcionesJWT.js");
const Google = require("./lib/oAuthGoogle");
const validateCredentials = require("./lib/funcionesValidacion.js");
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
server.use(bodyParser.json());
server.use(cors());
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


///////////////////////////////////////////////




///////////////////////ENDPOINTS///////////////////////
////////TIENES QUE HACER QUE LA CONTRASEÑA QUE ENTRE DENTRO DEL SERVIDOR ESTÉ ENCRIPTADA ADEMÁS DE CORREGIR ESTE ENDPOINT//////////////
/////// REGISTER END POINT/////////  (SE PUEDEN HACER AMBAS BÚSQUEDAS DENTRO DE LA BASE DE DATOS EN UNA QUERY)
// server.post("/register", (req, res) => {

// 	let newUser = req.body;


// 	if (newUser.name && newUser.familyName && newUser.email && newUser.userName && newUser.password) {

// 		connection.query(`SELECT * FROM users WHERE Email = ?;`,[newUser.email], function (err, result) {

// 			if (err) {

// 				console.log(err);
// 				return;

// 			}

// 			if (!result.length) {

// 				connection.query(`SELECT * FROM users WHERE user_name = ?;`,[newUser.userName], function (err, result) {

// 					if(err){
// 						console.log(err);
// 						return;
// 					}

// 					if (!result.length) {
					
// 						connection.query(`INSERT INTO users (tel, created_at, user_name, Email, Password, apicultor) VALUES (${newUser.tel},${new Date()},${newUser.user_name},${newUser.Email},${newUser.password}, ${newUser.apicultor});`)
// 						const Payload = {

// 							"userName": newUser.user_name,
// 							"iat": new Date(),
// 							"role": "User",
// 							"ip": req.connection.remoteAddress
// 						};
// 						connection.end();
// 						return res.cookie("jwt", generateJWT(Payload), options).send({"msg": "New user has been created."}); //"sessionCookie", "digimonCookie", options).send(generateJWT(Payload))
// 					} else {res.send("User name or Email already exists")}
// 				})
// 			}

// 		});

// 	} else	{
// 		connection.end();
// 		res.send("User name or Email already exists")
// 	}


// });






//CORRECCIÓN DEL REGISTER //
/////// REGISTER END POINT/////////  (SE PUEDEN HACER AMBAS BÚSQUEDAS DENTRO DE LA BASE DE DATOS EN UNA QUERY)
server.post("/register", (req, res) => {

	let newUser = req.body;


	if (newUser.name && newUser.familyName && newUser.email && newUser.userName && newUser.password && newUser.name && newUser.familyName && validateCredentials(newUser.Email, newUser.password)) {

		connection.query(`SELECT * FROM users WHERE Email = ? OR user_name = ?;`,[newUser.email, newUser.userName], function (err, result) {

			if (err) {

				console.log(err);
				return;

			}

			

				if (!result.length) {

					let encryptedPass = JWT.encryptPassword(newUser.password);

					connection.query(`INSERT INTO users (tel, created_at, user_name, name, family_name, Email, Passw, SALT, apicultor) VALUES (${newUser.tel},${new Date()},${newUser.user_name}, ${newUser.name}, ${newUser.familyName}, ${newUser.Email},${encryptedPass.password}, ${encryptedPass.salt},  ${newUser.apicultor});`)
					
					const Payload = {

						"userName": newUser.user_name,
						"iat": new Date(),
						"role": "User",
						"ip": req.connection.remoteAddress
					};

					connection.end();
					return res.cookie("jwt", JWT.generateJWT(Payload), options).send({"msg": "New user has been created."}); //"sessionCookie", "digimonCookie", options).send(generateJWT(Payload))
			} else {res.send("User name or Email already exists")} 
		})
			

	

	} else	{
		connection.end();
		res.send("Format error")
	}


});


//////  LOGIN ENDPOINT ESTÁ CORREGIDO FALTA COMPROBACIÓN //////////

server.post("/login", (req, res) => {

	const {userName, password} = req.body; //VARIABLE QUE CONTIENE EL JSON LOS DATOS ENCRIPTADOS DEL FRONT.
	
	let JWT = req.cookies.jwt;

	if (JWT) {
        //If the JWT was verified, I sent them the info, if not, clear the cookie
        if (JWT.verifyJWT(JWT))
            res.send(JWT.getJWTInfo(JWT));
        else {
            res.clearCookie("jwt");
            res.send({ msg: "invalid session" });
        }
    } else {
		//////////AQUÍ TENDRÍA QUE IR LA PARTE DE VERIFY PASSWORD O PODEMOS HACERLO CON BCRYPT => LINEA 123 DE https://github.com/TheBridge-FullStackDeveloper/ft-sep20-Backend-examples/blob/main/jwt/server.js////////////
		if (userName && password){


		connection.query(sqlFn.querySQL("users", "user_name", `${userName}`), function (err, result) {

			
			
			if (err) {

				console.log(err);
				return;
			}

			let queryResult = result[0];
			
			let realPassword = {
				password : queryResult.passw,
				salt : queryResult.salt
			}

			if (verifyPassword(queryResult.password, realPassword)) { //El password que queremos comprobar es el queryResult.password

				const Payload = {

					"userName": userName,
					"iat": new Date(),
					"role": "User",
					"ip": req.connection.remoteAddress
				};
				res.cookie("jwt", JWT.generateJWT(Payload), options).send({"msg": Payload}); 
			}  else {
				res.send("Wrong user or password");
			}

			connection.end();
		});
	}}


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
                            res.send({"res" : "0", "msg" : err})
                        } else if (result.length){

                                //Generate JWT
                                const Payload = {
                                    "id_facebook" : result[0].id_facebook,
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
                                    res.send({"res" : "0", "msg" : "JWT not verified"})
                                }
                                
                            
                        } else {

                            res.send({"res" : "2", "msg" : "User facebook to fill form", data});

                        }
                        connection.end();
                    });
                })
                prom.catch(e => res.send({"res" : "0", "msg" : "Unable to connect to database", e}));
            }

        } else {

            res.send({"res" : "0", "msg" : "Error in credentials"})
        }
    } else {
        res.send({"res" : "0", "msg" : "Left credentials"})
    }
});





server.get("/google-login", async (req, res) => {

	const {code} = req.query;
	if (code) {

		if(userData){

		
		
		const userData = await Google.getGoogleUser(code);
	
		const {id, email, name} = userData;

		const Validated = validateEmail(email);
		
		if(Validated) {

			connection.query("SELECT * FROM users U INNER JOIN googleUsers GU ON GU.id_google = U.id WHERE Email = ?;",[email], (err, result) => {

				if(err){
											
					console.log(err);
					//Mensaje que devolveremos a front siempre que haya un error con conexión a base de datos.
					res.send({"res" : "0", "msg" : err}); 
				} 

				else if (result.length){

					 //Generate JWT
					 const Payload = {
						"id_google" : result[0].id_google,
						"name" : result[0].name,
						"email" : result[0].email,
						"iat" : new Date()
					};

					const jwt = JWT.generateJWT(Payload);
					const jwtVerified = JWT.verifyJWT(jwt);

					if(jwtVerified) {
						
						res.cookie("JWT", jwt, {"httpOnly" : true})
							.send({"res" : "1", "msg" : `${result[0].name} has been found in DB and logged in with google`});
							
					} 
				} else {

					res.send({"res" : "2", "msg" : "User Google to fill form", userData})
				}
				connection.end();

			}).catch((e) => {
                        
				res.send({"res" : "0", "msg" : "Unable to connect to database", e});
			});
			
		}	else {
						
			res.send({"res" : "0", "msg" : "JWT not verified"})
				.clearCookie(JWT);	}					
		
		
	} else {
		res.send({"res" : "0", "msg" : "No userData"});
	}	

	} else {
        res.send({"res" : "0", "msg" : "No code"})
    }
})






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
///////////////ESTE ENDPOINT PROBABLEMENTE NO SE UTILICE PUESTO QUE SE SUPONE QUE LOS FILTROS OCURREN EN BACK//////////
server.get("/products", (req, res) => {  //Puede que haya que cambiar este endpoint puesto que necesitamos también long/lat


	
	connection.query(`SELECT * FROM products;`, function (err, result) {

		if (err) {

			console.log(err);
			return;
		}

		connection.end();
		res.send(result);

	})
})

/////////////OBTENCIÓN DE PRODUCTOS DE UN ID_USUARIO EN PARTICULAR (DE UN USUARIO APICULTOR) ---CARTA 2D/2A---  /////////////////

server.get("/productsByUserId/:ID", (req, res) => {

	let userID = req.params.ID 

	connection.query(`SELECT * FROM products WHERE id_users = ?;`,[userID], (err, result) => {

		if (err) {

			console.log(err);
			return;
		}

		connection.end();
		res.send(result);

		
	})
})


/////////OBTENCIÓN DE PUNTOS DE VENTA PARA POSTERIOR ORDENACIÓN  ---CARTA2--- ////////////////
server.get("/sellingPoints", (req, res) => {


		
	connection.query("SELECT * FROM products_selling_points;", function (err, result) {

		if (err) {

			console.log(err);
			return;
		}

		connection.end();
		res.send(result);

	})
})


server.get("/sellingPoints/:userLat/:userLon", (req, res) => {

	connection.query("SELECT * FROM products_selling_points;", function (err, result) {
		///////////////////RECIBIMOS TANTO COORDENADAS COMO ID DE APICULTOR, POSIBLEMENTE UTILICEMOS ESTO PARA MOSTRAR ALGO DE INFO EN CADA UNO DE LOS PUNTOS QUE APARECEN DENTRO DEL MAPA/////////////////
		/////////////////EN LA BASE DE DATOS LOS DATOS DE COORDENADAS VIENEN EN FORMATO: "40.421562099999996,-3.6927109999999996"  POR EJEMPLO, SIEMPRE CON EN ORDEN LAT,LONG Y EN FORMA DE STRING /////////////
		if (err) {

			console.log(err);
			return;
		}

		/////////////////////funcion coordenadas ////////////////
		let userLat = req.params.userLat * 1;
		let userLon = req.params.userLon * 1;
		let sellingPoints = result;
		let arrayUsersInRange = [];

		
		sellingPoints.map((elemento, idx) => {

			let formatedCoord = elemento.long_lat.split(",");
			let apicLat = formatedCoord[0] * 1;
			let apicLon = formatedCoord[1] * 1;

			if (calcDistance(userLat, userLon, apicLat, apicLon) <= 5000) {

				arrayUsersInRange.push(elemento);
			}



		})
		connection.end();
		res.send(arrayUsersInRange);

	})	
})




//ENDPOINT id- APICULTORES JUNTO CON SU LONG/LAT (users_selling_points)=> POR HACER ---CARTA2D ???? COMPRENDO QUE ESTO ES PARA LA CARTA2---
server.get("/usersApicCoord", (req, res) => {

	connection.query("SELECT * FROM users_selling_points;", (err, result) => {

		if (err) {
			console.log(err);
			return;

		}

		connection.end();
		res.send(result);

	})
})
//ENDPOINT DE INFORMACION DE APICULTOR JUNTO CON SU LONG/LAT (users_selling_points)=> POR HACER ---CARTA2D---	 HACEMOS UN JOIN PARA EVITAR TENER QUE HACER MÁS DE UNA QUERY, HACEMOS JOIN DE TABLA users y tabla users_selling_points a partir del users_id para obtener tanto la info del apicultor como sus coordenadas 
				///////////////PROBAR///////////////END-POINT PARA PARTE MORADA/NEGRA DE ABAJO//////////////////																									//LA QUERY PRETENDE SACAR DE LA TABLA USERS TANTO EMAIL COMO FECHA DE CREACIÓN DEL USUARIO HACIENDO UN JOIN CON LA TABLA USERS_SELLING POINTS A PARTIR DE LAS COINCIDENCIA DE ID DONDE EL ID SEA = A LA QUERY
server.get("/usersApicInfoByID/:ID", (req, res) => {

	let query = req.params.ID
	connection.query(`SELECT users.user_name, products.id, products.product_name, products.product_type, products.picture, products.rating, selling_points.location FROM users JOIN apicultores ON users.id = apicultores.id_users JOIN products ON apicultores.id_apicultor = products.id_apicultor JOIN selling_points ON selling_points.id_apicultor = apicultores.id_apicultor WHERE users.id = ?`,[query], (err, result) => {

		if (err) {
			console.log(err);
			return;

		}

		connection.end();
		res.send(result);

	})
})



//ENDPOINT DE PRODUCTOS FAVORITOS DEL CONSUMIDOR/APICULTOR => SE OBTIENEN LOS PRODUCTOS FAVORITOS DEL USUARIO QUE LO ESTÁ UTILIZANDO---CARTA5/2D--- 

server.get("/productsFav/:ID", (req, res) => {

	let query = req.params.ID;

	connection.query(`SELECT * FROM users_products_fav WHERE id_users = ?;`, [query], (err, result) => {

		if(err){
			
			console.log(err);		
		}

		connection.end();
		res.send(result);
	})
})



/////////////////ENDPOINTS DEL CHAT//////////////////
///////////////RECIBIR ID DE USUARIO/////////////////
server.get("/getUserId/:userName", (req, res) => {

	let userName = req.params.userName;
	
	connection.query(`SELECT id from users WHERE user_name =?;`, [userName], (err, result) => {

		if(err){
			console.log(err);
		}
		
		connection.end();
		res.send(result[0].id)
	})
})
////////////////CORREGIDO FALTA COMPROBACIÓN///////////////////////
///////////////RECIBIR CONVERSACIÓN DE USUARIO CON OTRO USUARIO EN PARTICULAR////////////////////
server.get("/getChat/:userId/:userId2", (req, res) => {

	let userId = req.params.userId;
	let userId2 = req.params.userId2;

	

	connection.query(`SELECT id_chats from chats_users WHERE id_users = ? OR id_users = ?;`, [userId, userId2], (err, result) => {
		
		if (err){
			console.log (err);
		}


		let idArray = sqlFn.sqlArrayMap(result, "id_chats");


		let fireBaseQuery = findDuplicates(idArray);

		dataBase.ref(`idChats/${fireBaseQuery}`).once("value", (snapshot) => {

			let content = snapshot.val();
			let messages = content.messages;
			connection.end();
			
			res.send(JSON.stringify(messages));

		})

	})



	
})
///////////////CORREGIDO FALTA COMPROBACIÓN////////////////
///////////////INSERTAR NUEVO MENSAJE EN CHAT/////////////

server.post("/newChatMessage", (req, res) => {
	//recibimos JSON desde front un JSON con:  Id de usuario que hace el envío del mensaje como id del chat que existe con la persona a la que quiere enviar el mensaje
	let idChat = req.body.chatId;
	let idUser = req.body.userId;
	let message = req.body.message
	let timeNow = Date.now();
	
	let newMessage = {

		time: timeNow 
		
	}

	//creamos una nueva llave con el idUser dentro del objeto newMessage que es igual al mensaje que recibimos desde front 
	newMessage[idUser] = message;

	dataBase.ref(`idChats/${idChat}/messages`).push(newMessage);
	dataBase.ref(`idChats/${idChat}/lastActivity`.set(timeNow));

	 
	
	
	connection.query(`INSERT INTO chats (id, created_at) VALUES (?, ?);`, [idChat, timeNow])

})
// SE PUEDE OBTIMIZAR Y HAY QUE COMPROBAR//////////////
///////////CREAR NUEVO CHAT///////////////////
server.post("/newChat", (req, res) => {

	
	let userId = req.body.userId;
	let userId2 = req.body.userId2;


	connection.query("SELECT * FROM chats_users WHERE id_user = ?;", [userId], (err, result1) => {

		//Flag que se activa si se encuentra una coincidencia de id_chats entre dos usuarios
		let flag = false;	
		//creamos un array con los id_chat a partir del array que hemos recibido
		let arrayChatId1 = sqlFn.sqlArrayMap(result1, "id_chats");

		if(err) {
			console.log(err);
		}
		//si existen datos dentro del array recibido como parámetro:
		if (result1.length){
			connection.query("SELECT * FROM chats_users WHERE id_user = ?;", [userId2], (err, result2) => {

				if(err) {
					console.log(err);
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
				connection.query(`INSERT INTO chats_users (id_chats, id_users) VALUES (?, ?);`, [randomId, userId])
				connection.query(`INSERT INTO chats_users (id_chats, id_users) VALUES (?, ?);`, [randomId, userId2])
				connection.query(`INSERT INTO chats (id, created_at, last_activity) VALUES (?, ?, ?);`, [randomId, timeNow, timeNow])

				connection.end();

			} else {
				connection.end();
				res.send("There's already a Chat created between these users")
			}

			
			
			
		})}
		
	
	})
	

})

//////////////////QUERY QUE TENEMOS QUE PROBAR PARA OPTIMIZAR/////////////////////
//SELECT id_chats FROM chats_users WHERE id_users = ${idUser2} AND id_chats IN(SELECT id_chats FROM chats_users WHERE id_users == ${idUser1})


server.listen(listenPort, () => {
	console.log(`http://localhost:5678/ server listening on port ${listenPort}`);
});