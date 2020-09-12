class BridgetField {
	constructor() {
		this.MAIN_WIDTH = 736;
		this.MAIN_HEIGHT = 576;
		this.WIPE_WIDTH = 288;
		this.WIPE_HEIGHT = 288;

		this.BOARD_SIZE = 160;
		this.BLOCK_SIZE = 16;
		this.MAINCAMERA_DISTANCE = 200;
		this.MAINCAMERA_FOV = 45;
		this.WIPECAMERA_DISTANCE = 1200;
		this.WIPECAMERA_FOV = 10;

		this.init();
	}

	// ------------------------------------------------------------
	// Three.js 関連
	// ------------------------------------------------------------

	init() {
		this.maincanvas = document.createElement("canvas"); // メイン
		this.wipecanvas1 = document.createElement("canvas"); // ワイプ 1 (固定カメラ)
		this.wipecanvas2 = document.createElement("canvas"); // ワイプ 1 (回転)
		this.blocks = [];

		// レンダラ (メイン)
		this.mainrenderer = new THREE.WebGLRenderer({canvas: this.maincanvas});
		this.mainrenderer.setPixelRatio(window.devicePixelRatio);
		this.mainrenderer.setSize(this.MAIN_WIDTH, this.MAIN_HEIGHT);
		this.mainrenderer.setClearColor(0xCCCCCC);

		// レンダラ (ワイプ 1)
		this.wiperenderer1 = new THREE.WebGLRenderer({canvas: this.wipecanvas1});
		this.wiperenderer1.setPixelRatio(window.devicePixelRatio);
		this.wiperenderer1.setSize(this.WIPE_WIDTH, this.WIPE_HEIGHT);
		this.wiperenderer1.setClearColor(0xCCCCCC);

		// レンダラ (ワイプ2)
		this.wiperenderer2 = new THREE.WebGLRenderer({canvas: this.wipecanvas2});
		this.wiperenderer2.setPixelRatio(window.devicePixelRatio);
		this.wiperenderer2.setSize(this.WIPE_WIDTH, this.WIPE_HEIGHT);
		this.wiperenderer2.setClearColor(0xCCCCCC);

		// シーン
		this.scene = new THREE.Scene();

		// カメラ (メイン)
		this.maincamera = new THREE.PerspectiveCamera(this.MAINCAMERA_FOV, this.MAIN_WIDTH / this.MAIN_HEIGHT);
		this.maincamera.up.set(0, 0, 1); // z 軸が上になるように変更
		this.maincamera_phi = -Math.PI / 3;
		this.maincamera_theta = Math.PI / 4;

		// カメラ (ワイプ) // NOTE: ワイプ 1 と 2 で使いまわし
		this.wipecamera = new THREE.PerspectiveCamera(this.WIPECAMERA_FOV, this.WIPE_WIDTH / this.WIPE_HEIGHT);
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
		this.material_p = [];
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
		window.addEventListener("load", () => { this.tick(); }, false);
	}

	tick() {
		// メイン
		this.maincamera.position.set(
			this.MAINCAMERA_DISTANCE * Math.cos(this.maincamera_phi) * Math.cos(this.maincamera_theta),
			this.MAINCAMERA_DISTANCE * Math.sin(this.maincamera_phi) * Math.cos(this.maincamera_theta),
			this.MAINCAMERA_DISTANCE * Math.sin(this.maincamera_theta)
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

	mouseDown(x, y) {
		if(x < 0 || x >= window.innerWidth || y < 0 || y >= window.innerHeight) { return; }
		this.pointerX = x;
		this.pointerY = y;
	}

	mouseMove(x, y) {
		if(x < 0 || x >= window.innerWidth || y < 0 || y >= window.innerHeight) { this.mouseUp(); }
		if(!this.pointerX || !this.pointerY) { return; }

		this.maincamera_phi   -= (x - this.pointerX) * Math.PI / this.MAIN_WIDTH;
		this.maincamera_theta += (y - this.pointerY) * Math.PI / this.MAIN_HEIGHT;
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

	pushBlock(color, arr) {
		let b = [];
		for(let p of arr) {
			let x = p[0], y = p[1], z = p[2];
			let obj = new Object();
			obj.material = this.material_p[color];
			obj.geometry = new THREE.BoxGeometry(this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
			obj.mesh = new THREE.Mesh(obj.geometry, obj.material);
			obj.mesh.position.set((x - 4.5) * this.BLOCK_SIZE, -(y - 4.5) * this.BLOCK_SIZE, (z + 0.5) * this.BLOCK_SIZE);

			b.push(obj);
			this.scene.add(obj.mesh);
		}
		this.blocks.push(b);
	}

	popBlock() {
		let b = this.blocks.pop();
		for(let obj of b) {
			this.scene.remove(obj.mesh);
			obj.geometry.dispose();
			obj.material.dispose();
		}

		return b;
	}

	clearBlocks() {
		while(this.blocks.length > 0) { this.popBlock(); }
	}
}

let f = new BridgetField();
document.body.appendChild(f.canvasTag());
f.pushBlock(0, [[5, 4, 0], [5, 5, 0], [6, 4, 0], [6, 5, 0]]);
f.pushBlock(1, [[5, 6, 0], [5, 6, 1], [5, 5, 1], [5, 5, 2]]);
//f.popBlock();
//f.clearBlocks();
console.log(f);
