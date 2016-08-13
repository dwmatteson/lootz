var dCtx = document.getElementById('drawCanvas').getContext('2d');
var vCtx = document.getElementById('viewCanvas').getContext('2d');
var sCtx = document.getElementById('spriteCanvas').getContext('2d');

var imagePath = 'images/';
var imageConst = {
	'blockSize' : { 'x' : 16, 'y' : 16 },
	'spriteSize' : { 'x' : 32, 'y' : 32 },
	'sheetSize' : { 'x' : 12, 'y' : 8 },

	'sheetRows' : {
		'character-sheet' : ['front', 'left', 'right', 'back'],
		'fireball-sheet' : ['front', 'left', 'right', 'back'],
		'dragon-sheet' : ['front', 'left', 'right', 'back'],
		'skeleton-sheet' : ['front', 'left', 'right', 'back'],
		'stairs-sheet' : ['front' ]
	},

	'sheetChunks' : {
		'character-sheet' : [ 'nude', 'nude2', 'nude3', 'nude4', 'nude5', 'nude6', 'nude7', 'nude8' ],
		'fireball-sheet' : [ 'default' ],
		'dragon-sheet' : [ 'green', 'blue', 'yellow', 'red', 'black', 'silver', 'emerald', 'orange' ],
		'skeleton-sheet' : [ 'default', 'skel2', 'skel3', 'skel4', 'skel5', 'skel6', 'skel7', 'skel8' ],
		'stairs-sheet' : [ 'default' ]
	}
};

var dataConst = {
	'fireball' : {
		'speed' : 2,
		'castTime' : 2,
		'damage' : 25
	},

	'dragon' : {
		'hp' : 100,
		'speed' : 10,
		'wander' : true,
		'wanderTurnChance' : 0.25,
		'wanderMoveChance' : 0.75,
		'spell' : 'fireball',
		'castChance' : 0.25
	},

	'skeleton' : {
		'hp' : 50,
		'speed' : 6,
		'wander' : true,
		'wanderTurnChance' : 0.25,
		'wanderMoveChance' : 0.75
	}
};

var imageResourceList = ['gray-brick', 'dark-floor', 'character-sheet', 'fireball-sheet', 'dragon-sheet', 'skeleton-sheet', 'stairs-sheet'];
var loadCount = 0;
var loadDone = imageResourceList.length;

var imageData = {};
var roomData = {};
var playerData = {
	'screenPos' : { 'x' : (500 - imageConst.spriteSize.x), 'y' : (300 - imageConst.spriteSize.x) },
	'pos' : { 'x' : 70, 'y' : 70 },
	'facing' : 'front',
	'chunkName' : 'nude',
	'spriteSheet' : 'character-sheet',
	'moveFrame' : 0,
	'castTimer' : 0
};

var objectData = {};

var nextObjectId = 1;

var keyLeft = 37;
var keyUp = 38;
var keyRight = 39;
var keyDown = 40;
var keyQuit = 8;
var keyFire = 32;

var fpsCounter = 0;

var playerMove = {};

var doPlay = true;
var ii = 0;

// END GLOBAL VARIABLE SETUP

// FUNCTIONS BELOW

function generateBackground () {
	var rgbRands = { 'r':parseInt(Math.random()*100, 10)+10, 'g':parseInt(Math.random()*100, 10)+10, 'b':parseInt(Math.random()*100, 10)+10 };
	var bgColor = ['rgb('+parseInt(rgbRands.r/2, 10)+','+parseInt(rgbRands.g/2, 10)+','+parseInt(rgbRands.b/2, 10)+')', 'rgb('+rgbRands.r+','+rgbRands.g+','+rgbRands.b+')'];
	var bgCycle = 0;
	var tileSize = 20;
	var iy = 0;
	var ix = 0;
	var savedInstance;

	for (iy = 0; iy <= 600; iy = iy + tileSize) {
		for (ix = 0; ix <= 1000; ix = ix + tileSize) {
			dCtx.fillStyle = bgColor[bgCycle];
			dCtx.fillRect(ix, iy, tileSize, tileSize);
			bgCycle += 1;
			if (bgCycle >= bgColor.length) { bgCycle = 0; }
		}
	}

	savedInstance = document.getElementById('drawCanvas').toDataURL();

	imageData.background = {
		'data' : new Image()
	};
	imageData.background.data.src = savedInstance;
}

function parseSpriteSheet (imageName) {
	var row_counter = 0;
	var col_counter = 0;
	var row_name = '';
	var chunk_name = '';

	var stop_x = imageData[imageName].data.width - (imageConst.spriteSize.x-1);
	var stop_y = imageData[imageName].data.height - (imageConst.spriteSize.y-1);
	var ic = 0;
	var ir = 0;
	var sy = 0;
	var sx = 0;
	var inner_column = 0;
	var chunk_number = 0;
	var savedInstance;

	imageData[imageName].chunk = {};

	for (ic = 0; ic < imageConst.sheetChunks[imageName].length; ic += 1) {
		imageData[imageName].chunk[imageConst.sheetChunks[imageName][ic]] = [];
		imageData[imageName].chunk[imageConst.sheetChunks[imageName][ic]].row = {};
		for (ir = 0; ir < imageConst.sheetRows[imageName].length; ir += 1) {
			imageData[imageName].chunk[imageConst.sheetChunks[imageName][ic]].row[imageConst.sheetRows[imageName][ir]] = [];
		}
	}

	// document.title = imageName; 

	for (sy = 0; sy < stop_y; sy += imageConst.spriteSize.y) {
		row_name = imageConst.sheetRows[imageName][row_counter-(parseInt(row_counter/4, 10)*4)];
		row_counter += 1;
		col_counter = 0;
		for (sx = 0; sx < stop_x; sx += imageConst.spriteSize.x) {
			inner_column = col_counter - (parseInt(col_counter/3, 10)*3);
			chunk_number = parseInt(col_counter/3, 10);
			if (row_counter > 4) { chunk_number = chunk_number + 4; }
			chunk_name = imageConst.sheetChunks[imageName][chunk_number];
			
			sCtx.clearRect(0,0,imageConst.spriteSize.x,imageConst.spriteSize.y);
			sCtx.drawImage(imageData[imageName].data, sx, sy, imageConst.spriteSize.x, imageConst.spriteSize.y, 0, 0, imageConst.spriteSize.x, imageConst.spriteSize.y);
			savedInstance = document.getElementById('spriteCanvas').toDataURL();
			imageData[imageName].chunk[chunk_name].row[row_name][inner_column] = new Image();
			imageData[imageName].chunk[chunk_name].row[row_name][inner_column].src = savedInstance;
			col_counter += 1;
		}
	}
}

function spawnObject (objName) {
	var objId = nextObjectId;
	nextObjectId += 1;

	objectData[objId] = {};
	objectData[objId].name = objName;
	objectData[objId].moveFrame = 0;
	objectData[objId].animateTimer = 0;

	return objId;
}

function spawnDoodad (doodName, doodType, pos_x, pos_y, facing) {
	var doodId = spawnObject(doodName);

	objectData[doodId].objType = 'doodad';
	objectData[doodId].pos = { 'x':pos_x, 'y':pos_y };
	objectData[doodId].facing = facing;
	objectData[doodId].spriteSheet = doodName+'-sheet';
	objectData[doodId].chunkName = doodType;
	objectData[doodId].moveCounter = 0;
	objectData[doodId].wander = false;
	objectData[doodId].speed = 0;
}

function spawnMonster (monstName, monstType, pos_x, pos_y, facing) {
	var monsterId = spawnObject(monstName);

	objectData[monsterId].objType = 'monster';
	objectData[monsterId].pos = [];
	objectData[monsterId].pos.x = pos_x;
	objectData[monsterId].pos.y = pos_y;
	objectData[monsterId].facing = facing;
	objectData[monsterId].spriteSheet = monstName+'-sheet';
	objectData[monsterId].chunkName = monstType;
	objectData[monsterId].moveCounter = 0;
	objectData[monsterId].hp = dataConst[monstName].hp;
	objectData[monsterId].maxHp = dataConst[monstName].hp;
	objectData[monsterId].wander = dataConst[monstName].wander;
	objectData[monsterId].wanderTurnChance = dataConst[monstName].wanderTurnChance;
	objectData[monsterId].wanderMoveChance = dataConst[monstName].wanderMoveChance;
	objectData[monsterId].spell = dataConst[monstName].spell;
	objectData[monsterId].castChance = dataConst[monstName].castChance;
	objectData[monsterId].speed = dataConst[monstName].speed;
	objectData[monsterId].castTimer = 0;
}

function createRoom (origin_x, origin_y, size_x, size_y, wallImage, floorImage) {
	var ix = 0;
	var iy = 0;

	for (ix = origin_x; ix <= (origin_x+size_x); ix += 1) {
		if (roomData.blocks[ix] === undefined) {
			roomData.blocks[ix] = [];
		}
		for (iy = origin_y; iy <= (origin_y+size_y); iy += 1) {
			if (roomData.blocks[ix][iy] === undefined) {
				roomData.blocks[ix][iy] = {};
			}
			if (ix === origin_x || iy === origin_y || (ix === (origin_x+size_x)) || (iy === (origin_y+size_y))) {
				roomData.blocks[ix][iy].isWall = true;
				roomData.blocks[ix][iy].texture = wallImage;
			}
			else {
				roomData.blocks[ix][iy].isWall = false;
				roomData.blocks[ix][iy].texture = floorImage;
			}
		}
	}
}

function makeDoor (origin_x, origin_y, wallFace, floorImage) {
	var ix = 0;
	var iy = 0;

	if (wallFace === 'north' || wallFace === 'south') {
		for (ix = origin_x-2; ix <= origin_x+2; ix += 1) {
			roomData.blocks[ix][origin_y].isWall = false;
			roomData.blocks[ix][origin_y].texture = floorImage;
		}
	}
	else {
		for (iy = origin_y-2; iy <= origin_y+2; iy += 1) {
			roomData.blocks[origin_x][iy].isWall = false;
			roomData.blocks[origin_x][iy].texture = floorImage;
		}
	}
}

function createDungeon (maxRooms, wallImage, floorImage) {
	var roomChance = 0.25;
	var i = 0;
	var ii = 0;
	var thisRoom = 0;
	var size_x = 0;
	var size_y = 0;
	var origin_x = 0;
	var origin_y = 0;
	var center_x = 0;
	var center_y = 0;
	var checkPoints = [];
	var skipRoom = false;
	var newRoom = 0;

	var roomId = 0;
	var monstCount = 0;
	var pos_x = 0;
	var pos_y = 0;
	var lastRoomId = 0;

	roomData.blocks = [];
	roomData.walls = [];
	roomData.numWalls = 0;

	createRoom(65, 65, 20, 20, wallImage, floorImage);
	roomData.walls[0] = { 'face':'north', 'x':75, 'y':65, 'room':0 };
	roomData.walls[1] = { 'face':'east', 'x':85, 'y':75, 'room':0 };
	roomData.walls[2] = { 'face':'west', 'x':65, 'y':75, 'room':0 };
	roomData.walls[3] = { 'face':'south', 'x':75, 'y':85, 'room':0 };
	roomData.numWalls = 4;

	roomData.rooms = [];
	roomData.rooms[0] = { 'x':65, 'y':65, 'size_x':20, 'size_y':20 };
	roomData.roomCount = 1;

	for (i = 0; i < roomData.numWalls; i += 1) {
		if (roomData.walls[i] === undefined || Math.random() > roomChance) { 
			roomChance = roomChance + 0.25;
			continue; 
		}
		roomChance = 0.25;

		thisRoom = roomData.walls[i].room;

		size_x = parseInt((Math.random() * 20) + 10, 10);
		size_y = parseInt((Math.random() * 20) + 10, 10);

		origin_x = roomData.walls[i].x;
		origin_y = roomData.walls[i].y;

		// calculate origin (upper right point) of new room to be made
		if (roomData.walls[i].face === 'north') {
			origin_x = origin_x - parseInt(size_x / 2, 10);
			origin_y = origin_y - size_y;
		}
		else if (roomData.walls[i].face === 'east') {
			origin_y = origin_y - parseInt(size_y / 2, 10);
		}
		else if (roomData.walls[i].face === 'west') {
			origin_x = origin_x - size_x;
			origin_y = origin_y - parseInt(size_y / 2, 10);
		}
		else if (roomData.walls[i].face === 'south') {
			origin_x = origin_x - parseInt(size_x / 2, 10);
		}

		// try not to make overlapping rooms
		center_x = origin_x + parseInt(size_x /2, 10);
		center_y = origin_y + parseInt(size_y /2, 10);
		checkPoints = [ 
			{'x':center_x+parseInt(size_x/4, 10),'y':center_y}, 
			{'x':center_x-parseInt(size_x/4, 10),'y':center_y}, 
			{'x':center_x,'y':center_y+parseInt(size_y/4, 10)}, 
			{'x':center_x,'y':center_y-parseInt(size_y/4, 10)} 
		] ;

		skipRoom = false;
		for (ii = 0; ii < checkPoints.length; ii += 1) {
			if (roomData.blocks[checkPoints[ii].x] !== undefined && roomData.blocks[checkPoints[ii].x][checkPoints[ii].y] !== undefined) {
				skipRoom = true;
				break;
			}
		}
		if (skipRoom === true) { continue; }

		createRoom(origin_x, origin_y, size_x, size_y, wallImage, floorImage);
		makeDoor(roomData.walls[i].x, roomData.walls[i].y, roomData.walls[i].face, floorImage);

		newRoom = roomData.roomCount;
		roomData.rooms[newRoom] = { 'x':origin_x, 'y':origin_y, 'size_x':size_x, 'size_y':size_y };

		roomData.rooms[thisRoom][roomData.walls[i].face] = newRoom;

		// add new room's walls to the available walls to make rooms off of
		if (roomData.walls[i].face === 'north') {
			roomData.walls[roomData.numWalls] = { 'face':'north', 'x':origin_x+parseInt(size_x/2, 10), 'y':origin_y, 'room':newRoom };
			roomData.walls[roomData.numWalls+1] = { 'face':'east', 'x':origin_x+size_x, 'y':origin_y+parseInt(size_y/2, 10), 'room':newRoom };
			roomData.walls[roomData.numWalls+2] = { 'face':'west', 'x':origin_x, 'y':origin_y+parseInt(size_y/2, 10), 'room':newRoom };
		}
		else if (roomData.walls[i].face === 'east') {
			roomData.walls[roomData.numWalls] = { 'face':'north', 'x':origin_x+parseInt(size_x/2, 10), 'y':origin_y, 'room':newRoom };
			roomData.walls[roomData.numWalls+1] = { 'face':'east', 'x':origin_x+size_x, 'y':origin_y+parseInt(size_y/2, 10), 'room':newRoom };
			roomData.walls[roomData.numWalls+2] = { 'face':'south', 'x':origin_x+parseInt(size_x/2, 10), 'y':origin_y+size_y, 'room':newRoom };
		}
		else if (roomData.walls[i].face === 'west') {
			roomData.walls[roomData.numWalls] = { 'face':'north', 'x':origin_x+parseInt(size_x/2, 10), 'y':origin_y, 'room':newRoom };
			roomData.walls[roomData.numWalls+1] = { 'face':'west', 'x':origin_x, 'y':origin_y+parseInt(size_y/2, 10), 'room':newRoom };
			roomData.walls[roomData.numWalls+2] = { 'face':'south', 'x':origin_x+parseInt(size_x/2, 10), 'y':origin_y+size_y, 'room':newRoom };
		}
		else if (roomData.walls[i].face === 'south') {
			roomData.walls[roomData.numWalls] = { 'face':'east', 'x':origin_x+size_x, 'y':origin_y+parseInt(size_y/2, 10), 'room':newRoom };
			roomData.walls[roomData.numWalls+1] = { 'face':'west', 'x':origin_x, 'y':origin_y+parseInt(size_y/2, 10), 'room':newRoom };
			roomData.walls[roomData.numWalls+2] = { 'face':'south', 'x':origin_x+parseInt(size_x/2, 10), 'y':origin_y+size_y, 'room':newRoom };
		}
		roomData.numWalls = roomData.numWalls + 3;

		// mark the wall we just made a room off of as no longer available
		delete roomData.walls[i];

		roomData.roomCount += 1;

		if (roomData.roomCount > maxRooms) { break; }
	}

	for (roomId = 0; roomId < roomData.roomCount; roomId += 1) {
		monstCount = parseInt((Math.random() * 5) + 0, 10);

		for (i = 0; i < monstCount; i += 1) {
			pos_x = parseInt((Math.random() * (roomData.rooms[roomId].size_x-4)) + roomData.rooms[roomId].x+2, 10);
			pos_y = parseInt((Math.random() * (roomData.rooms[roomId].size_y-4)) + roomData.rooms[roomId].y+2, 10);

			//var dragonType = parseInt(Math.random()*imageConst.sheetChunks['dragon-sheet'].length);
			//spawnMonster('dragon', imageConst.sheetChunks['dragon-sheet'][dragonType], pos_x, pos_y, 'front');

			spawnMonster('skeleton', 'default', pos_x, pos_y, 'front');
		}
	}

	lastRoomId = roomData.roomCount - 1;
	spawnDoodad('stairs', 'default', roomData.rooms[lastRoomId].x+parseInt(roomData.rooms[lastRoomId].size_x/2, 10), roomData.rooms[lastRoomId].y+parseInt(roomData.rooms[lastRoomId].size_y/2, 10), 'front');
}

function drawDungeon () {
	var start_x = playerData.pos.x - parseInt(500 / 16, 10)+1;
	var start_y = playerData.pos.y - parseInt(300 / 16, 10)+1;
	var stop_x = playerData.pos.x + parseInt(500 / 16, 10)+3;
	var stop_y = playerData.pos.y + parseInt(300 / 16, 10)+3;

	var distance_x = 0;
	var distance_y = 0;
	var pos_x = 0;
	var pos_y = 0;
	var ix = 0;
	var iy = 0;

	for (ix = start_x; ix < stop_x; ix += 1) {
		if (roomData.blocks[ix] === undefined) { continue; }
		for (iy = start_y; iy < stop_y; iy += 1) {
			if (roomData.blocks[ix][iy] === undefined) { continue; }
			distance_x = ix - playerData.pos.x;
			pos_x = parseInt(playerData.screenPos.x + (imageConst.blockSize.x * distance_x), 10);

			distance_y = iy - playerData.pos.y;
			pos_y = parseInt(playerData.screenPos.y + (imageConst.blockSize.y * distance_y), 10);

			dCtx.drawImage(imageData[roomData.blocks[ix][iy].texture].data, pos_x, pos_y);
		}
	}
}

function drawObjects () {
	dCtx.fillStyle = 'rgb(256,0,0)';

	var objectImage = {};
	var distance_x = 0;
	var distance_y = 0;
	var pos_x = 0;
	var pos_y = 0;
	var bar_width = 0;
	var id = 0;

	for (id = 0; id < nextObjectId; id += 1) {
		if (objectData[id] !== undefined) {
			objectImage = imageData[objectData[id].spriteSheet].chunk[objectData[id].chunkName].row[objectData[id].facing][objectData[id].moveFrame];
			distance_x = objectData[id].pos.x - playerData.pos.x;
			pos_x = parseInt(playerData.screenPos.x + (imageConst.blockSize.x * distance_x), 10);
		
			distance_y = objectData[id].pos.y - playerData.pos.y;
			pos_y = parseInt(playerData.screenPos.y + (imageConst.blockSize.y * distance_y), 10);

			dCtx.drawImage(objectImage, pos_x, pos_y);

			if (objectData[id].objType === 'monster') {
				bar_width = parseInt((objectData[id].hp / objectData[id].maxHp) * (imageConst.spriteSize.x-2), 10);
				dCtx.fillRect(pos_x + 1, pos_y - 3, bar_width, 2);
			}
		}
	}
}

function drawPlayer () {
	var playerImage = imageData[playerData.spriteSheet].chunk[playerData.chunkName].row[playerData.facing][playerData.moveFrame];

	dCtx.drawImage(playerImage, playerData.screenPos.x, playerData.screenPos.y);
}

function drawFrame () {
	// blank out the canvas with the background
	dCtx.drawImage(imageData.background.data, 0, 0);

	drawDungeon();
	drawObjects();
	drawPlayer();

	fpsCounter += 1;

	// swap from draw buffer to view buffer
	vCtx.drawImage(document.getElementById('drawCanvas'), 0, 0);
}


function checkCollision (pos_x, pos_y, chkObjId) {
	var objId = 0;

	if (chkObjId !== 'player' && (objectData[chkObjId].casterId === undefined || objectData[chkObjId].casterId !== 'player')) {
		if (pos_x >= playerData.pos.x && pos_x <= (playerData.pos.x+1)
		&& pos_y >= playerData.pos.y && pos_y <= (playerData.pos.y+1)) {
			return 'player';
		}
	}
	for (objId = 0; objId < nextObjectId; objId += 1) {
		if (objectData[objId] === undefined || objId === chkObjId) { continue; }
		if (pos_x >= objectData[objId].pos.x && pos_x <= (objectData[objId].pos.x+1) 
		&& pos_y >= objectData[objId].pos.y && pos_y <= (objectData[objId].pos.y+1)) {
			return objId;
		}
	}

	return undefined;
}

function killMonster (monsterId) {
	delete objectData[monsterId];
}


function doCollision (objectId, colObjId) {
	if (colObjId === 'player') {
		return;
	}

	if (colObjId !== undefined) {
		if (objectData[objectId].objType === 'spell' && objectData[colObjId].objType === 'monster') {
			objectData[colObjId].hp = Number(objectData[colObjId].hp) - Number(objectData[objectId].damage);
			if (objectData[colObjId].hp < 1) {
				killMonster(colObjId);
			}
		}
	}

	if (objectData[objectId].delCollide === true) {
		delete objectData[objectId];
	}
	else if (colObjId === undefined && objectData[objectId].wander === true) {
		if (objectData[objectId].facing === 'front') { objectData[objectId].facing = 'back'; }
		else if (objectData[objectId].facing === 'right') { objectData[objectId].facing = 'left'; }
		else if (objectData[objectId].facing === 'left') { objectData[objectId].facing = 'right'; }
		else { objectData[objectId].facing = 'front'; }
	}
}

function animateObjectMove (objectId) {
	if (objectData[objectId].moveFrame === 2) {
		objectData[objectId].moveFrame = 0;
	}
	else {
		objectData[objectId].moveFrame = 2;
	}
}

function castSpell (spellName, casterName, casterId) {
	var pos_x = 0;
	var pos_y = 0;
	var facing = 'front';

	var spellObjectId;

	if (casterName === 'player') {
		if (playerData.castTimer > 0) { return; }
		playerData.castTimer = dataConst[spellName].castTime;

		pos_x = playerData.pos.x;
		pos_y = playerData.pos.y;
		facing = playerData.facing;
	}
	else {
		if (objectData[casterId].castTimer > 0) { return; }
		playerData.casterTimer = dataConst[spellName].castTime;

		pos_x = objectData[casterId].pos.x;
		pos_y = objectData[casterId].pos.y;
		facing = objectData[casterId].facing;
	}

	spellObjectId = spawnObject(spellName);

	objectData[spellObjectId].objType = 'spell';
	objectData[spellObjectId].facing = facing;
	objectData[spellObjectId].spriteSheet = spellName+'-sheet';
	objectData[spellObjectId].chunkName = 'default';
	objectData[spellObjectId].pos = [];
	objectData[spellObjectId].pos.x = pos_x;
	objectData[spellObjectId].pos.y = pos_y;
	objectData[spellObjectId].speed = dataConst[spellName].speed;
	objectData[spellObjectId].damage = dataConst[spellName].damage;
	objectData[spellObjectId].moveCounter = 0;
	objectData[spellObjectId].delCollide = true;
	objectData[spellObjectId].casterId = casterId;
}

function moveObjects () {
	var objId = 0;
	var pos_x = 0;
	var pos_y = 0;
	var col_pos_x = 0;
	var col_pos_y = 0;
	var new_pos_x = 0;
	var new_pos_y = 0;
	var colObjId;

	for (objId = 0; objId < nextObjectId; objId += 1) {
		if (objectData[objId] === undefined || objectData[objId].speed === 0) { 
			continue; 
		}

		pos_x = objectData[objId].pos.x;
		pos_y = objectData[objId].pos.y;

		//document.getElementById('bar').innerHTML = 'objPos('+pos_x+','+pos_y+')';

		objectData[objId].moveCounter += 1;
		if (objectData[objId].speed > objectData[objId].moveCounter) { 
			//objectData[objId].moveFrame = 1;
			continue; 
		}
		objectData[objId].moveCounter = 0;

		if (objectData[objId].wander === true) {
			if (Math.random() > objectData[objId].wanderMoveChance) { continue; }
			if (Math.random() <= objectData[objId].wanderTurnChance) {
				objectData[objId].facing = imageConst.sheetRows[objectData[objId].spriteSheet][Math.floor(Math.random() * 4)];
			}
		}

		if (objectData[objId].castTimer > 0) { objectData[objId].castTimer -= 1; }
		else {
			if (objectData[objId].spell !== undefined) {
				if (Math.random() <= objectData[objId].castChance) {
					castSpell(objectData[objId].spell, 'monster', objId);
				}
			}
		}

		col_pos_x = pos_x;
		col_pos_y = pos_y;

		new_pos_x = pos_x;
		new_pos_y = pos_y;

		objectData[objId].hasCollided = false;
		if (objectData[objId].facing === 'left') {
			col_pos_x = col_pos_x -1;
			new_pos_x = new_pos_x -1;
		}
		else if (objectData[objId].facing === 'back') {
			col_pos_y = col_pos_y -1;
			new_pos_y = new_pos_y -1;
		}
		else if (objectData[objId].facing === 'front') {
			col_pos_y = col_pos_y +2;
			new_pos_y = new_pos_y +1;
		}
		else if (objectData[objId].facing === 'right') {
			col_pos_x = col_pos_x +2;
			new_pos_x = new_pos_x +1;
		}

		colObjId = checkCollision(col_pos_x, col_pos_y, objId);
		if (colObjId === undefined) {
			if (objectData[objId].facing === 'left' || objectData[objId].facing === 'right') {
				colObjId = checkCollision(col_pos_x, col_pos_y+1, objId);
			}
			else {
				colObjId = checkCollision(col_pos_x+1, col_pos_y, objId);
			}
		}

		if (colObjId !== undefined && objectData[objId].casterId !== colObjId) {
			doCollision(objId, colObjId);
		}
		else if (roomData.blocks[col_pos_x][col_pos_y].isWall === true 
			|| ((objectData[objId].facing === 'left' || objectData[objId].facing === 'right') && roomData.blocks[col_pos_x][col_pos_y+1].isWall === true)
			|| ((objectData[objId].facing === 'back' || objectData[objId].facing === 'front') && roomData.blocks[col_pos_x+1][col_pos_y].isWall === true)) {
			objectData[objId].moveFrame = 1;
			doCollision(objId, undefined);
		}
		else {
			objectData[objId].pos.x = new_pos_x;
			objectData[objId].pos.y = new_pos_y;
			animateObjectMove(objId);
		}
	}
}

function animatePlayerMove () {
	if (playerData.moveFrame === 2) {
		playerData.moveFrame = 0;
	}
	else {
		playerData.moveFrame = 2;
	}
}

function doMove () {
	var new_pos_x = playerData.pos.x;
	var new_pos_y = playerData.pos.y;

	var col_pos_x = playerData.pos.x;
	var col_pos_y = playerData.pos.y;

	var colObjId;

	playerData.isMoving = false;
	if (playerMove.left === true) {
		new_pos_x -= 1;
		col_pos_x -= 1;
		playerData.facing = 'left';
		playerData.isMoving = true;
	}
	if (playerMove.up === true) {
		new_pos_y -= 1;
		col_pos_y -= 1;
		playerData.facing = 'back';
		playerData.isMoving = true;
	}
	if (playerMove.down === true) {
		new_pos_y += 1;
		col_pos_y += 2;
		playerData.facing = 'front';
		playerData.isMoving = true;
	}
	if (playerMove.right === true) {
		new_pos_x += 1;
		col_pos_x += 2;
		playerData.facing = 'right';
		playerData.isMoving = true;
	}

	if (roomData.blocks[col_pos_x][col_pos_y].isWall === true
	|| ((playerData.facing === 'left' || playerData.facing === 'right') && roomData.blocks[col_pos_x][col_pos_y+1].isWall === true)
	|| ((playerData.facing === 'front' || playerData.facing === 'back') && roomData.blocks[col_pos_x+1][col_pos_y].isWall === true)) {
		playerData.moveFrame = 1;
		playerData.isMoving = false;
		return;
	}

	colObjId = checkCollision(col_pos_x, col_pos_y, 'player');
	if (colObjId === undefined) {
		if (playerData.facing === 'left' || playerData.facing === 'right') {
			colObjId = checkCollision(col_pos_x, col_pos_y+1, 'player');
		}
		else {
			colObjId = checkCollision(col_pos_x+1, col_pos_y, 'player');
		}
	}

	if (colObjId !== undefined) {
		if (objectData[colObjId].name === 'stairs') {
			window.location.reload(); // generate new level
		}
		else {
			playerData.moveFrame = 1;
			playerData.isMoving = false;
			return;
		}
	}

	if (playerData.isMoving === true) {
		playerData.pos.x = new_pos_x;
		playerData.pos.y = new_pos_y;
		animatePlayerMove();
	}
	else {
		playerData.moveFrame = 1;
	}
}

function doPulse () {
	//document.getElementById('foo').innerHTML = fpsCounter * 4+' ('+playerData.pos.x+','+playerData.pos.y+')';
	//fpsCounter = 0;

	if (playerData.castTimer > 0) { playerData.castTimer -= 1; }
}

function mainLoop () {
	setInterval(doPulse, 250);
	setInterval(doMove, 100);
	setInterval(moveObjects, 20);
	setInterval(drawFrame, parseInt(1000/30, 10)); 
}

function checkLoad () {
	loadCount = parseInt(loadCount, 10) + 1;

	if (loadCount >= loadDone) {
		createDungeon(20, 'gray-brick', 'dark-floor');

		mainLoop();
	}
}

function loadImageResource (imageName) {
	imageData[imageName] = {};

	imageData[imageName].data = new Image();
	imageData[imageName].data.src = imagePath+imageName+'.png';

	if (imageName.match(/\-sheet$/i)) {
		imageData[imageName].data.onload = function() { parseSpriteSheet(imageName); checkLoad(); };
	}
	else {
		imageData[imageName].data.onload = function() { checkLoad(); };
	}
}

// END FUNCTIONS

// PROGRAM RUNS HERE 

document.onkeydown = function (evt) {
	if (evt.keyCode === keyLeft) { playerMove.left = true; }
	else if (evt.keyCode === keyUp) { playerMove.up = true; }
	else if (evt.keyCode === keyDown) { playerMove.down = true; }
	else if (evt.keyCode === keyRight) { playerMove.right = true; }
	else if (evt.keyCode === keyQuit) { doPlay = false; }
	else if (evt.keyCode === keyFire) { castSpell('fireball','player','player'); }
};

document.onkeyup = function (evt) {
	if (evt.keyCode === keyLeft) { playerMove.left = false; }
	else if (evt.keyCode === keyUp) { playerMove.up =  false; }
	else if (evt.keyCode === keyDown) { playerMove.down = false; }
	else if (evt.keyCode === keyRight) { playerMove.right = false; }
};

generateBackground();
for (ii = 0; ii < imageResourceList.length; ii += 1) {
	loadImageResource(imageResourceList[ii]);
}


