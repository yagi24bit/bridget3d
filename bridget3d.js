class BridgetField {
	constructor() {
		this.MAIN_WIDTH = 1024;
		this.MAIN_HEIGHT = 576;

		this.init();
	}

	// ------------------------------------------------------------
	// Three.js 関連
	// ------------------------------------------------------------

	init() {
		this.maincanvas = document.createElement("canvas");
		this.blocks = [];

		// レンダラ
		this.renderer = new THREE.WebGLRenderer({canvas: this.maincanvas});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.MAIN_WIDTH, this.MAIN_HEIGHT);
		this.renderer.setClearColor(0xCCCCCC);

		// シーン
		this.scene = new THREE.Scene();

		// カメラ
		this.camera = new THREE.PerspectiveCamera(45, this.MAIN_WIDTH / this.MAIN_HEIGHT);
		this.camera.up.set(0, 0, 1); // z 軸が上になるように変更
		this.camera_radius = 200;
		this.camera_phi = -Math.PI / 6;
		this.camera_theta = Math.PI / 4;

		var img, texture;

		// 盤面
		//TODO: let texture = new THREE.TextureLoader().load('textures/board.png');
		img = new Image();
		img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAIAAAAErfB6AAADQUlEQVR42u3da27kIBCFUXonWcosfZaSnSSRRhpF8SPmYQPFub+ipOx03w8XBdj49fH+N1FcvQAGmAD+OtHbn4un+or8//Ovh3wPvhL/48Dc8+cech68PXnuUfV02gC+6Oa2HZw3i+1fLzajf2FXgq+3y92vmXV4wVcuOH9jwLmX4zbm6Dvk/n4bcAfg65+/nm4Txo+m6NEAN2QDcJujsphdDL6YhLbBBX1kbpvrn6Lv6412O4K27mT1qbt1xh05YMQiq75aqf8vxRXZ3V1GTS825RWcVQln/f7oVE16gUrAzWuUQQHXt4OGLemZom8hwPUlVfM+75lxeXE7mCxFF8zs1FStdxQ1ZZ+noEAZrsiiMfXKvSZY1l15yAAGuHz8Kr5vPMBrA94dFTA0COCjqVeGTg/4ZBzGUCkaAIDFAyweYPEAAwwwwAADzNBJATNoUcDUVwADLEVL0QyKDPhoQYmhEQCf3JrL0OkBn99cz1CAAZityJKiIwPe9scMDQLYTXfBh0knwyeGhhomMTR+Fc3QUIB34wyTwg6TGGo9mB4VwABL0VI0g9IKTxcm68Hhx8EWG+IA/nUzN4YCDID1YPEjAN7dopmhrmAA9MHiARZvHCzeTBbA5qIBPru4qYsABliKlqIZlFbYZUcVnQLPRW9fwcvQIICP3tDKUIABmOrZJIBT7LlogFPs1SSAowE+nz1haLSJDlcwwAwFWPywgBmarAfTwwIYYClaimZQWuSuyu9nZGgQwDZCA5ihcwK2090SgL2zITLgLVRFVvBhkqcLAWbozEUWwJGHSfpgbz5j6OR9MEPXAkx9BTDAUrQUzSBVNEPnnOhI5qJjAzaTFRbw+WIwQ4MAttNdZMBp75Wy+uDgKVofDDBDARY/5jBJH2y/aIZOBZhBqwOmvgIYYClaimZQCrxceJQWGBrzCjbRERmwiQ6AGQqw+DEB28oQYIZOC3h3ZYmhAIsHWHx3wEc3SDM04EwWQ9cCTH0FMMBStBTNoOT5YIZOCdg+WZEBez4YYIZK0QAossS7gsXrg8UDDLAUrchiaDDADFoaMPUVwACXAqbpBDDABDABTAATwAQwAQwwAUwAE8AEMAFMx/oEOXiM8QOOmp8AAAAASUVORK5CYII=';
		texture = new THREE.Texture(img);
		texture.format = THREE.RGBFormat;
		texture.needsUpdate = true;
		const board = new THREE.Mesh(new THREE.BoxGeometry(160, 160, 2), new THREE.MeshBasicMaterial({map: texture}));
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
		this.camera.position.set(
			this.camera_radius * Math.cos(this.camera_phi) * Math.cos(this.camera_theta),
			this.camera_radius * Math.sin(this.camera_phi) * Math.cos(this.camera_theta),
			this.camera_radius * Math.sin(this.camera_theta)
		);
		this.camera.lookAt(new THREE.Vector3(0, 0, -16));
		this.renderer.render(this.scene, this.camera);
	}

	// ------------------------------------------------------------
	// DOM 関連
	// ------------------------------------------------------------

	canvasTag() {
		return this.maincanvas;
	}

	mouseDown(x, y) {
		if(x < 0 || x >= window.innerWidth || y < 0 || y >= window.innerHeight) { return; }
		this.pointerX = x;
		this.pointerY = y;
	}

	mouseMove(x, y) {
		if(x < 0 || x >= window.innerWidth || y < 0 || y >= window.innerHeight) { this.mouseUp(); }
		if(!this.pointerX || !this.pointerY) { return; }

		this.camera_phi   -= (x - this.pointerX) * Math.PI / this.MAIN_WIDTH;
		this.camera_theta += (y - this.pointerY) * Math.PI / this.MAIN_HEIGHT;
		if(this.camera_theta < 0) { this.camera_theta = 0; } else if(this.camera_theta > Math.PI / 2) { this.camera_theta = Math.PI / 2; }
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
			obj.geometry = new THREE.BoxGeometry(16, 16, 16);
			obj.mesh = new THREE.Mesh(obj.geometry, obj.material);
			obj.mesh.position.set((x - 4.5) * 16, -(y - 4.5) * 16, (z + 0.5) * 16);

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
