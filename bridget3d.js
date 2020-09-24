class BridgetField {
	constructor() {
		// Three.js 関連の定数
		this.BOARD_SIZE = 160;
		this.BLOCK_SIZE = 16;
		this.MAINCAMERA_DISTANCE = 360;
		this.MAINCAMERA_FOV = 30;
		this.WIPECAMERA_DISTANCE = 1200;
		this.WIPECAMERA_FOV = 10;

		// Bridget 関連の定数
		this.FIELD_WIDTH = 8;
		this.FIELD_HEIGHT = 8;
		this.FIELD_DEPTH = 3;

		this.COLOR_EMPTY = 0;
		this.COLOR_WHITE = 1;
		this.COLOR_BLACK = 2;

		this.initLogic();
		this.initView();
	}

	// ------------------------------------------------------------
	// Three.js 関連
	// ------------------------------------------------------------

	initView() {
		this.maincanvas = document.createElement("canvas"); // メイン
		this.wipecanvas1 = document.createElement("canvas"); // ワイプ 1 (固定カメラ)
		this.wipecanvas2 = document.createElement("canvas"); // ワイプ 1 (回転)
		this.maincanvas.style.position = "absolute";
		this.maincanvas.style.left = "0px";
		this.maincanvas.style.top = "0px";
		this.wipecanvas1.style.position = "absolute";
		this.wipecanvas2.style.position = "absolute";
		this.blocks = [];

		// レンダラ (メイン)
		this.mainrenderer = new THREE.WebGLRenderer({canvas: this.maincanvas});
		this.mainrenderer.setPixelRatio(window.devicePixelRatio);
		this.mainrenderer.setClearColor(0xCCCCCC);

		// レンダラ (ワイプ 1)
		this.wiperenderer1 = new THREE.WebGLRenderer({canvas: this.wipecanvas1});
		this.wiperenderer1.setPixelRatio(window.devicePixelRatio);
		this.wiperenderer1.setClearColor(0xCCCCCC);

		// レンダラ (ワイプ2)
		this.wiperenderer2 = new THREE.WebGLRenderer({canvas: this.wipecanvas2});
		this.wiperenderer2.setPixelRatio(window.devicePixelRatio);
		this.wiperenderer2.setClearColor(0xCCCCCC);

		// シーン
		this.scene = new THREE.Scene();

		// カメラ (メイン)
		this.maincamera = new THREE.PerspectiveCamera(this.MAINCAMERA_FOV, this.MAIN_WIDTH / this.MAIN_HEIGHT);
		this.maincamera.up.set(0, 0, 1); // z 軸が上になるように変更
		this.maincamera_phi = -Math.PI / 3;
		this.maincamera_theta = Math.PI / 4;

		// カメラ (ワイプ) // NOTE: ワイプ 1 と 2 で使いまわし
		this.wipecamera = new THREE.PerspectiveCamera(this.WIPECAMERA_FOV, 1);
		this.wipecamera.up.set(0, 0, 1); // z 軸が上になるように変更

		var img, texture;

		// 盤面
		//TODO: let texture = new THREE.TextureLoader().load('textures/board.png');
		img = new Image();
		img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAIAAAAErfB6AAADQUlEQVR42u3da27kIBCFUXonWcosfZaSnSSRRhpF8SPmYQPFub+ipOx03w8XBdj49fH+N1FcvQAGmAD+OtHbn4un+or8//Ovh3wPvhL/48Dc8+cech68PXnuUfV02gC+6Oa2HZw3i+1fLzajf2FXgq+3y92vmXV4wVcuOH9jwLmX4zbm6Dvk/n4bcAfg65+/nm4Txo+m6NEAN2QDcJujsphdDL6YhLbBBX1kbpvrn6Lv6412O4K27mT1qbt1xh05YMQiq75aqf8vxRXZ3V1GTS825RWcVQln/f7oVE16gUrAzWuUQQHXt4OGLemZom8hwPUlVfM+75lxeXE7mCxFF8zs1FStdxQ1ZZ+noEAZrsiiMfXKvSZY1l15yAAGuHz8Kr5vPMBrA94dFTA0COCjqVeGTg/4ZBzGUCkaAIDFAyweYPEAAwwwwAADzNBJATNoUcDUVwADLEVL0QyKDPhoQYmhEQCf3JrL0OkBn99cz1CAAZityJKiIwPe9scMDQLYTXfBh0knwyeGhhomMTR+Fc3QUIB34wyTwg6TGGo9mB4VwABL0VI0g9IKTxcm68Hhx8EWG+IA/nUzN4YCDID1YPEjAN7dopmhrmAA9MHiARZvHCzeTBbA5qIBPru4qYsABliKlqIZlFbYZUcVnQLPRW9fwcvQIICP3tDKUIABmOrZJIBT7LlogFPs1SSAowE+nz1haLSJDlcwwAwFWPywgBmarAfTwwIYYClaimZQWuSuyu9nZGgQwDZCA5ihcwK2090SgL2zITLgLVRFVvBhkqcLAWbozEUWwJGHSfpgbz5j6OR9MEPXAkx9BTDAUrQUzSBVNEPnnOhI5qJjAzaTFRbw+WIwQ4MAttNdZMBp75Wy+uDgKVofDDBDARY/5jBJH2y/aIZOBZhBqwOmvgIYYClaimZQCrxceJQWGBrzCjbRERmwiQ6AGQqw+DEB28oQYIZOC3h3ZYmhAIsHWHx3wEc3SDM04EwWQ9cCTH0FMMBStBTNoOT5YIZOCdg+WZEBez4YYIZK0QAossS7gsXrg8UDDLAUrchiaDDADFoaMPUVwACXAqbpBDDABDABTAATwAQwAQwwAUwAE8AEMAFMx/oEOXiM8QOOmp8AAAAASUVORK5CYII=';
		texture = new THREE.Texture(img);
		texture.format = THREE.RGBFormat;
		texture.needsUpdate = true;
		const board = new THREE.Mesh(new THREE.BoxGeometry(this.BOARD_SIZE, this.BOARD_SIZE, 2), new THREE.MeshBasicMaterial({map: texture}));
		board.position.set(0, 0, -1);
		this.scene.add(board);

		// 駒のマテリアル
		this.material_p = [null];
		//TODO: texture = new THREE.TextureLoader().load('textures/piece0.png');
		img = new Image();
		img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAMklEQVR42mNkoDFgBOL/Z9JoZbrJrFELRi0YtWDUglELRi0YtWDUglELRi0YURbQFAAAWGNaIeSs6kcAAAAASUVORK5CYII=';
		texture = new THREE.Texture(img);
		texture.format = THREE.RGBFormat;
		texture.needsUpdate = true;
		this.material_p.push(new THREE.MeshBasicMaterial({map: texture}));
		//TODO: texture = new THREE.TextureLoader().load('textures/piece1.png');
		img = new Image();
		img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAMElEQVR42mNkoDFgBOKZabQyPX3WqAWjFoxaMGrBqAWjFoxaMGrBqAWjFowsC2gKAGL4PCFk42VaAAAAAElFTkSuQmCC';
		texture = new THREE.Texture(img);
		texture.format = THREE.RGBFormat;
		texture.needsUpdate = true;
		this.material_p.push(new THREE.MeshBasicMaterial({map: texture}));

		this.addMouseListener();
		this.resize();
		window.addEventListener("resize", () => { this.resize(); }, false);
		window.addEventListener("load", () => { this.tick(); }, false);
	}

	tick() {
		// メイン
		this.maincamera.position.set(
			// NOTE: θ=0 のときにカメラが Z 軸に乗らないように、少しだけずらす
			(this.MAINCAMERA_DISTANCE * Math.sin(this.maincamera_theta) + 1) * Math.cos(this.maincamera_phi),
			(this.MAINCAMERA_DISTANCE * Math.sin(this.maincamera_theta) + 1) * Math.sin(this.maincamera_phi),
			this.MAINCAMERA_DISTANCE * Math.cos(this.maincamera_theta)
		);
		this.maincamera.lookAt(new THREE.Vector3(0, 0, -this.BLOCK_SIZE));
		this.mainrenderer.render(this.scene, this.maincamera);

		// ワイプ
		this.wipecamera.position.set(0, -1, this.WIPECAMERA_DISTANCE);
		this.wipecamera.lookAt(new THREE.Vector3(0, 0, 0));
		this.wiperenderer1.render(this.scene, this.wipecamera);
		this.wipecamera.position.set(Math.cos(this.maincamera_phi), Math.sin(this.maincamera_phi), this.WIPECAMERA_DISTANCE);
		this.wipecamera.lookAt(new THREE.Vector3(0, 0, 0));
		this.wiperenderer2.render(this.scene, this.wipecamera);
	}

	// ------------------------------------------------------------
	// DOM 関連
	// ------------------------------------------------------------

	canvasTag() {
		let div = document.createElement("div");

		div.appendChild(this.maincanvas);
		div.appendChild(this.wipecanvas1);
		div.appendChild(this.wipecanvas2);

		return div;
	}

	resize() {
		let winwidth = window.innerWidth;
		let winheight = window.innerHeight;

		// サイズを変更
		let unitsize = Math.floor(
			winwidth > winheight
			? Math.min(winwidth / 16, winheight / 9) // landscape
			: Math.min(winwidth / 9, winheight / 16) // portrait
		);
		this.MAIN_WIDTH  = unitsize * (winwidth > winheight ? 11.5 : 9);
		this.MAIN_HEIGHT = unitsize * (winwidth > winheight ? 9 : 11.5);
		this.WIPE_WIDTH  = unitsize * 4.5;
		this.WIPE_HEIGHT = unitsize * 4.5;
		this.mainrenderer.setSize(this.MAIN_WIDTH, this.MAIN_HEIGHT);
		this.wiperenderer1.setSize(this.WIPE_WIDTH, this.WIPE_HEIGHT);
		this.wiperenderer2.setSize(this.WIPE_WIDTH, this.WIPE_HEIGHT);

		// 表示位置を変更
		if(winwidth > winheight) {
			// landscape
			this.wipecanvas1.style.left = this.MAIN_WIDTH + "px";
			this.wipecanvas1.style.top = "0px";
			this.wipecanvas2.style.left = this.MAIN_WIDTH + "px";
			this.wipecanvas2.style.top = this.WIPE_HEIGHT + "px";
		} else {
			// portrait
			this.wipecanvas1.style.left = "0px";
			this.wipecanvas1.style.top = this.MAIN_HEIGHT + "px";
			this.wipecanvas2.style.left = this.WIPE_WIDTH + "px";
			this.wipecanvas2.style.top = this.MAIN_HEIGHT + "px";
		}

		// 再描画
		this.maincamera.aspect = this.MAIN_WIDTH / this.MAIN_HEIGHT;
		this.maincamera.zoom = (winwidth > winheight ? 1 : (9 / 11.5) ** 2);
		this.maincamera.updateProjectionMatrix();
		this.tick();
	}

	mouseDown(x, y) {
		if(x < 0 || x >= window.innerWidth || y < 0 || y >= window.innerHeight) { return; }
		this.pointerX = x;
		this.pointerY = y;
	}

	mouseMove(x, y) {
		if(x < 0 || x >= window.innerWidth || y < 0 || y >= window.innerHeight) { this.mouseUp(); }
		if(!this.pointerX || !this.pointerY) { return; }

		this.maincamera_phi   -= (x - this.pointerX) * Math.PI / this.MAIN_WIDTH;
		this.maincamera_theta -= (y - this.pointerY) * Math.PI / this.MAIN_HEIGHT;
		if(this.maincamera_theta < 0) { this.maincamera_theta = 0; } else if(this.maincamera_theta > Math.PI / 2) { this.maincamera_theta = Math.PI / 2; }
		this.mouseDown(x, y);

		this.tick();
	}

	mouseUp() {
		this.pointerX = null;
		this.pointerY = null;
	}

	addMouseListener() {
		// mousedown
		window.addEventListener("mousedown", (ev) => {
			if(ev.button != 0) { return; }
			this.mouseDown(ev.clientX - this.maincanvas.offsetLeft, ev.clientY - this.maincanvas.offsetTop);
			try { ev.preventDefault(); } catch(ex) {}
			try { ev.returnValue = false; } catch(ex) {}
		}, false);

		// mousemove
		window.addEventListener("mousemove", (ev) => {
			this.mouseMove(ev.clientX - this.maincanvas.offsetLeft, ev.clientY - this.maincanvas.offsetTop);
			try { ev.preventDefault(); } catch(ex) {}
			try { ev.returnValue = false; } catch(ex) {}
		}, false);

		// mouseup
		window.addEventListener("mouseup", (ev) => {
			this.mouseUp();
		}, false);
	}

	// ------------------------------------------------------------
	// 内部処理
	// ------------------------------------------------------------

	initLogic() {
		this.field =
			Array.from(new Array(this.FIELD_DEPTH), () => {
				return Array.from(new Array(this.FIELD_HEIGHT), () => {
					return new Array(this.FIELD_WIDTH).fill(this.COLOR_EMPTY)
				})
			})
		;
	}

	parseBridgetNotation(str) {
		const template = [
			[[ 0,  0,  0], [ 0,  1,  0], [ 0,  2,  0], [ 1,  2,  0]], // L
			[[ 0,  0,  0], [ 0, -1,  0], [ 0, -2,  0], [ 1, -2,  0]], // J
			[[ 0,  0,  0], [ 1,  0,  0], [ 2,  0,  0], [ 0,  0,  1]], // P
			[[ 0,  0,  0], [ 0,  0,  1], [ 1,  0,  1], [ 2,  0,  1]], // H
			[[ 0,  0,  0], [ 1,  0,  0], [ 0,  0,  1], [ 0,  0,  2]], // B
			[[ 0,  0,  0], [ 0,  0,  1], [ 0,  0,  2], [ 1,  0,  2]], // C
			[[ 0,  0,  0], [ 1,  0,  0], [ 0,  1,  0], [ 1,  1,  0]], // O
			[[ 0,  0,  0], [ 1,  0,  0], [ 0,  0,  1], [ 1,  0,  1]], // W
			[[ 0,  0,  0], [ 1,  0,  0], [ 1, -1,  0], [ 2, -1,  0]], // S
			[[ 0,  0,  0], [ 1,  0,  0], [ 1,  1,  0], [ 2,  1,  0]], // Z
			[[ 0,  0,  0], [ 0,  0,  1], [ 1,  0,  1], [-1,  0,  0]], // D
			[[ 0,  0,  0], [ 0,  0,  1], [ 1,  0,  1], [ 1,  0,  2]], // A
			[[ 0,  0,  0], [ 1,  0,  0], [ 0,  1,  0], [ 0, -1,  0]], // T
			[[ 0,  0,  0], [ 1,  0,  0], [ 0,  0,  1], [-1,  0,  0]], // V
			[[ 0,  0,  0], [ 0,  0,  1], [ 1,  0,  1], [-1,  0,  1]], // U
			[[ 0,  0,  0], [ 0,  0,  1], [ 1,  0,  1], [ 0,  0,  2]]  // G
		];
		const piece = {L: 0, J: 1, P: 2, H: 3, B: 4, C: 5, O: 6, W: 7, S: 8, Z: 9, D: 10, A: 11, T: 12, V: 13, U: 14, G: 15};
		const direction = {E: 0, S: 1, W: 2, N: 3};
		const sin = [0, 1, 0, -1];
		const cos = [1, 0, -1, 0];

		// 引数チェック・パース
		let reg = /([1-8])([1-8])([ABCDGHJLOPSTUVWZ])([ENSW])/.exec(str.replaceAll(" ", "").toUpperCase());
		if(reg == null) {
			console.warn("invalid argument: (" + str + ")");
			return null;
		}
		let y = parseInt(reg[1], 10), x = parseInt(reg[2], 10), p = reg[3], d = reg[4];

		// 回転・平行移動して配列に格納
		// NOTE: one-based index を zero-based index に変換
		let ret = [];
		let t = template[piece[p]];
		for(let i = 0; i < t.length; i++) {
			let tx = t[i][0], ty = t[i][1], tz = t[i][2];
			let s = sin[direction[d]], c = cos[direction[d]];
			ret.push([x + tx * c - ty * s - 1, y + tx * s + ty * c - 1, tz]);
		}

		return ret;
	}

	pushBlock(color, arr) {
		// ブロックが置けるかどうかのチェック
		for(let p of arr) {
			let x = p[0], y = p[1], z = p[2];
			if(x < 0 || x >= this.FIELD_WIDTH || y < 0 || y >= this.FIELD_HEIGHT) { return false; }
			if(this.field[z][y][x] != this.COLOR_EMPTY) { return false; }
			if(z > 0 && this.field[z - 1][y][x] == this.COLOR_EMPTY && !arr.some(a => a[0] == x && a[1] == y && a[2] == z - 1)) { return false; }
		}

		// ブロックを置く
		let b = [];
		for(let p of arr) {
			let x = p[0], y = p[1], z = p[2];
			this.field[z][y][x] = color;

			let obj = new Object();
			obj.x = x;
			obj.y = y;
			obj.z = z;
			obj.material = this.material_p[color];
			obj.geometry = new THREE.BoxGeometry(this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
			obj.mesh = new THREE.Mesh(obj.geometry, obj.material);
			obj.mesh.position.set((x - 3.5) * this.BLOCK_SIZE, -(y - 3.5) * this.BLOCK_SIZE, (z + 0.5) * this.BLOCK_SIZE);

			b.push(obj);
			this.scene.add(obj.mesh);
		}
		this.blocks.push(b);

		return true;
	}

	popBlock() {
		let b = this.blocks.pop();
		if(!b) { return null; }

		for(let obj of b) {
			this.scene.remove(obj.mesh);
			obj.geometry.dispose();
			obj.material.dispose();

			this.field[obj.z][obj.y][obj.x] = this.COLOR_EMPTY;
		}

		return b;
	}

	clearBlocks() {
		while(this.blocks.length > 0) { this.popBlock(); }
	}
}

let f = new BridgetField();
document.body.appendChild(f.canvasTag());
//f.pushBlock(1, [[4, 3, 0], [4, 4, 0], [5, 3, 0], [5, 4, 0]]);
//f.pushBlock(2, [[4, 5, 0], [4, 5, 1], [4, 4, 1], [4, 4, 2]]);
//f.popBlock();
//f.clearBlocks();
let kifu = [[2, "44WS"], [1, "45CW"], [2, "43VS"], [1, "42CE"], [2, "46BS"], [1, "55GE"], [2, "66CN"], [1, "65WS"], [2, "64CE"], [1, "63GN"], [2, "52CE"], [1, "51VS"], [2, "62GW"], [1, "71CN"], [2, "82VE"], [1, "35WE"], [2, "27WS"], [1, "73VE"], [2, "77VS"], [1, "12ZS"], [2, "13DW"], [1, "15DW"], [2, "84DW"], [1, "23DW"]]
for(let k of kifu) {
	f.pushBlock(k[0], f.parseBridgetNotation(k[1]));
}
f.tick();
console.log(f);
