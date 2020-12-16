//DEPENDENCIAS Y CONFIGURACIÓN INICIAL
const firebase = require('firebase');
const express = require("express");
const server = express();
const myPublicFiles = express.static("../public");			//CONEXIÓN CON FICHERO public
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const base64 = require("base-64");
const crypto = require("crypto");
const listenPort = 5678;
const sql = require("mysql");								//MÓDULO PARA CONEXIÓN CON SQL



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
  ///////////////////////////////////////////////////////////////////
//CONFIG SQL
let connection = sql.createConnection({

	"host"     : process.env.HOST_SQL,
	"user"     : process.env.USER_SQL,
	"password" : process.env.PASSWORD_SQL, 
	"database" : process.env.DATABASE_SQL
});
console.log("SQL connection:", connection);

 
const options = {

	"maxAge": 1000 * 60 * 15 * 4 * 24 * 15, // would expire after 15 days		////// OPTIONS DE JWT//////
	"httpOnly": true, // The cookie only accessible by the web server
	"signed": true // Indicates if the cookie should be signed
};
 
server.use(myPublicFiles);
server.use(bodyParser.urlencoded({"extended":false}));
server.use(bodyParser.json());
server.use(cors());

////FUNCIONES//////
let querySQL = (table, column, query) => {

	return `SELECT * from ${table} where ${column} = ${query}`


}
const findDuplicates = (arr) => {
	let sorted_arr = arr.slice().sort(); // You can define the comparing function here. 
	// JS by default uses a crappy string compare.
	// (we use slice to clone the array so the
	// original array won't be modified)
	let results = [];
	for (let i = 0; i < sorted_arr.length - 1; i++) {
	  if (sorted_arr[i + 1] == sorted_arr[i]) {
		results.push(sorted_arr[i]);
	  }
	}
	return results;
}


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



///////////////////////ENDPOINTS///////////////////////

/////// REGISTER END POINT/////////  (SE PUEDEN HACER AMBAS BÚSQUEDAS DENTRO DE LA BASE DE DATOS EN UNA QUERY)
server.post("/register", (req, res) => {

	let newUser = req.body;


	if (newUser.email && newUser.userName && newUser.password) {

		connection.query(`SELECT * FROM users WHERE Email = ?;`,[newUser.email], function (err, result) {

			if (err) {

				console.log(err);
				return;

			}

			if (!result.length) {

				connection.query(`SELECT * FROM users WHERE user_name = ?;`,[newUser.userName], function (err, result) {

					if(err){
						console.log(err);
						return;
					}

					if (!result.length) {
					
						connection.query(`INSERT INTO users (tel, created_at, user_name, Email, Password, apicultor) VALUES (${newUser.tel},${new Date()},${newUser.user_name},${newUser.Email},${newUser.password}, ${newUser.apicultor});`)
						const Payload = {

							"userName": newUser.user_name,
							"iat": new Date(),
							"role": "User",
							"ip": req.ip
						};
						connection.end();
						return res.cookie("jwt", generateJWT(Payload), options).send({"msg": "New user has been created."}); //"sessionCookie", "digimonCookie", options).send(generateJWT(Payload))
					} else {res.send("User name or Email already exists")}
				})
			}

		});

	} else	{
		connection.end();
		res.send("User name or Email already exists")
	}


});


//////  LOGIN ENDPOINT  //////////
server.post("/login", (req, res) => {

	let encryptedLogin = req.body; //VARIABLE QUE CONTIENE EL JSON LOS DATOS ENCRIPTADOS DEL FRONT.
	


	if (encryptedLogin.userName && encryptedLogin.password){


		connection.query(querySQL("users", "user_name", `${encryptedLogin.userName}`), function (err, result) {

			if (err) {

				console.log(err);
				return;
			}

			let queryResult = result[0];
			if (queryResult && queryResult.password === encryptedLogin.password) {

				const Payload = {

					"userName": encryptedLogin.user,
					"iat": new Date(),
					"role": "User",
					"ip": req.ip
				};
				res.cookie("jwt", generateJWT(Payload), options).send({"msg": Payload}); //"sessionCookie", "digimonCookie", options).send(generateJWT(Payload)) ===> Aquí puede que tenga que ir la res.redirect
			}  else {
				res.send("Wrong user or password");
			}

			connection.end();
		});
	}
});

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
																													//LA QUERY PRETENDE SACAR DE LA TABLA USERS TANTO EMAIL COMO FECHA DE CREACIÓN DEL USUARIO HACIENDO UN JOIN CON LA TABLA USERS_SELLING POINTS A PARTIR DE LAS COINCIDENCIA DE ID DONDE EL ID SEA = A LA QUERY
server.get("/usersApicInfoByID/:ID", (req, res) => {

	let query = req.params.ID
	connection.query(`SELECT users.Email, users.created_at FROM users INNER JOIN users_selling_points ON users.id = users_selling_points.users_id WHERE id_users = ?;`,[query], (err, result) => {

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

/////////////////ENDPOINTS DEL CHAT/////////////////
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

///////////////RECIBIR CONVERSACIÓN DE USUARIO CON OTRO USUARIO EN PARTICULAR////////////////////
server.get("/getChat/:userId/:userId2", (req, res) => {

	let userId = req.params.userId;
	let userId2 = req.params.userId2;

	

	connection.query(`SELECT chats_id from chats_users WHERE id_users = ? OR id_users = ?;`, [userId, userId2], (err, result) => {
		
		if (err){
			console.log (err);
		}

		let idArray = result.map((element) => {
			return element.id_chats;
		})


		let fireBaseQuery = findDuplicates(idArray);

		dataBase.ref(`idChats/${fireBaseQuery}`).once("value", (snapshot) => {

			let content = snapshot.val();
			let messages = content.messages;
			connection.end();
			
			res.send(JSON.stringify(messages));

		})

	})



	
})
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

///////////CREAR NUEVO CHAT///////////////////
server.post("/newChat", (req, res) => {

	
	let userId = req.body.userId;
	let userId2 = req.body.userId2;

///HAY UNA FORMA MEJOR DE HACER ESTO ///////////////
	connection.query("SELECT * FROM chats_users WHERE id_user = ?;", [userId], (err, result1) => {

		let arrayChatId1 = result1.map((element) => {
			return element.id_chats;
		})

		if(err) {
			console.log(err);
		}
		if (result1.length){
			connection.query("SELECT * FROM chats_users WHERE id_user = ?;", [userId2], (err, result2) => {

				if(err) {
					console.log(err);
				}

			let arrayChatId2 = result2.map((element) => {
				
				return element.id_chats;		
			})
			 let flag = false;
			
			arrayChatId1.map((element, index) => {

				if (element === arrayChatId2[index]) return flag = true;

				 
			})
			

			//como el flag no se ha levantado puesto que no se ha encontrado un id_Chats común => creamos nuevo objeto dentro de Firebase
			if (!flag) {
				
				let timeNow = Date.now();
				let randomId = `${Math.floor(Math.random() * 1000000000000)}`;  // Número random de 12 cifras que hará de id único en FireBase
				let newChat = {
					createdDate : timeNow,
					usersInside : [`${userId}`, `${userId2}` ],
					lastActivity : timeNow,
					messages : {
					   
					}
				}

				//Actualizamos todas las tablas de SQL que tienen que ser actualizadas además de empujar el nuevo objeto dentro de FireBase

				dataBase.ref(`idChats/${randomId}`).set(newChat);
				
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












//FUNCIONES PARA CODIFICACION JWT  =====>> TODO ESTO VA EN FRONTEND

function encodeBase64(string) {
	const encodedString = base64.encode(string);
	const parsedString = encodedString
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
	return parsedString;
}

function decodeBase64(base64String) {
	const decodedString = base64.decoded(base64String);
	return decodedString;
}

function generateJWT(Payload) {
	const header = {
		"alg": "HS256",
		"typ": "JWT"
	};
	const base64Payload = encodeBase64(JSON.stringify(Payload));
	const base64Header = encodeBase64(JSON.stringify(header));
	const signature = encodeBase64(hash(`${base64Header}.${base64Payload}`));
	const JWT = `${base64Header}.${base64Payload}.${signature}`;
	return JWT;
}

function hash(string) {
	const hashedString = crypto
		.createHmac("sha256", process.env.SECRET)
		.update(string)
		.digest("base64");
	return hashedString;
}

function verifyJWT(jwt) {
	const [header, payload, signature] = jwt.split(".");
	if (header && payload && signature) {
		const expectedSignature = encodeBase64(hash(`${header}.${payload}`));
		if (expectedSignature === signature) {
			return true;
		}
	}
	return false;
}

function getJWTInfo(jwt) {
	const [payload] = jwt.split(".")[1];
	if (payload) {
		try {
			const data = JSON.parse(decodeBase64(payload));
			return data;
		} catch (e) {
			return null;
		}
	}
	return null;
}
// FUNCIONES DE ENCRIPTACION DE CONTRASEÑA

function encryptPassword(string) {
	const salt = "";
	let saltedPassword = salt + string + salt;

}
///////////////////////////////////////////////



server.listen(listenPort, () => {
	console.log(` http://localhost:5678/ server listening on port ${listenPort}`);
});