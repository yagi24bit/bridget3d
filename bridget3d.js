class BridgetField {
	constructor() {
		this.maincanvas = document.createElement("canvas");
		this.blocks = [];

		// 駒のマテリアル
		this.material_p = [];
		var img, texture;
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

		/*
			NOTE: 上記以外に登録するプロパティ
			this.renderer, this.scene, this.camera // THREE の各種オブジェクト
			this.camera_phi, this.camera_theta // カメラの角度 (それぞれ、x 軸から y 軸方向、xy 平面から z 軸方向)
		*/

		this.init();
		window.addEventListener("load", () => { this.tick(); }, false);
	}

	init() {
		const width = 1024;
		const height = 576;

		// レンダラ
		this.renderer = new THREE.WebGLRenderer({canvas: this.maincanvas});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(width, height);
		this.renderer.setClearColor(0xCCCCCC);

		// シーン
		this.scene = new THREE.Scene();

		// カメラ
		this.camera = new THREE.PerspectiveCamera(45, width / height);
		this.camera.up.set(0, 0, 1); // z 軸が上になるように変更
		this.camera_phi = -Math.PI / 6;
		this.camera_theta = Math.PI / 4;

		// 盤面
		//TODO: let texture = new THREE.TextureLoader().load('textures/board.png');
		let img = new Image();
		img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAIAAAAErfB6AAADQUlEQVR42u3da27kIBCFUXonWcosfZaSnSSRRhpF8SPmYQPFub+ipOx03w8XBdj49fH+N1FcvQAGmAD+OtHbn4un+or8//Ovh3wPvhL/48Dc8+cech68PXnuUfV02gC+6Oa2HZw3i+1fLzajf2FXgq+3y92vmXV4wVcuOH9jwLmX4zbm6Dvk/n4bcAfg65+/nm4Txo+m6NEAN2QDcJujsphdDL6YhLbBBX1kbpvrn6Lv6412O4K27mT1qbt1xh05YMQiq75aqf8vxRXZ3V1GTS825RWcVQln/f7oVE16gUrAzWuUQQHXt4OGLemZom8hwPUlVfM+75lxeXE7mCxFF8zs1FStdxQ1ZZ+noEAZrsiiMfXKvSZY1l15yAAGuHz8Kr5vPMBrA94dFTA0COCjqVeGTg/4ZBzGUCkaAIDFAyweYPEAAwwwwAADzNBJATNoUcDUVwADLEVL0QyKDPhoQYmhEQCf3JrL0OkBn99cz1CAAZityJKiIwPe9scMDQLYTXfBh0knwyeGhhomMTR+Fc3QUIB34wyTwg6TGGo9mB4VwABL0VI0g9IKTxcm68Hhx8EWG+IA/nUzN4YCDID1YPEjAN7dopmhrmAA9MHiARZvHCzeTBbA5qIBPru4qYsABliKlqIZlFbYZUcVnQLPRW9fwcvQIICP3tDKUIABmOrZJIBT7LlogFPs1SSAowE+nz1haLSJDlcwwAwFWPywgBmarAfTwwIYYClaimZQWuSuyu9nZGgQwDZCA5ihcwK2090SgL2zITLgLVRFVvBhkqcLAWbozEUWwJGHSfpgbz5j6OR9MEPXAkx9BTDAUrQUzSBVNEPnnOhI5qJjAzaTFRbw+WIwQ4MAttNdZMBp75Wy+uDgKVofDDBDARY/5jBJH2y/aIZOBZhBqwOmvgIYYClaimZQCrxceJQWGBrzCjbRERmwiQ6AGQqw+DEB28oQYIZOC3h3ZYmhAIsHWHx3wEc3SDM04EwWQ9cCTH0FMMBStBTNoOT5YIZOCdg+WZEBez4YYIZK0QAossS7gsXrg8UDDLAUrchiaDDADFoaMPUVwACXAqbpBDDABDABTAATwAQwAQwwAUwAE8AEMAFMx/oEOXiM8QOOmp8AAAAASUVORK5CYII=';
		let texture = new THREE.Texture(img);
		texture.format = THREE.RGBFormat;
		texture.needsUpdate = true;
		const board = new THREE.Mesh(new THREE.BoxGeometry(160, 160, 2), new THREE.MeshBasicMaterial({map: texture}));
		board.position.set(0, 0, -1);
		this.scene.add(board);
	}

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

	tick() {
		this.camera.position.set(
			200 * Math.cos(this.camera_phi) * Math.cos(this.camera_theta),
			200 * Math.sin(this.camera_phi) * Math.cos(this.camera_theta),
			200 * Math.sin(this.camera_theta)
		);
		this.camera.lookAt(new THREE.Vector3(0, 0, -16));
		this.renderer.render(this.scene, this.camera);

		this.camera_phi += 0.005;
		requestAnimationFrame(() => { this.tick(); });
	}

	canvasTag() {
		return this.maincanvas;
	}
}

let f = new BridgetField();
document.body.appendChild(f.canvasTag());
f.pushBlock(0, [[5, 4, 0], [5, 5, 0], [6, 4, 0], [6, 5, 0]]);
f.pushBlock(1, [[5, 6, 0], [5, 6, 1], [5, 5, 1], [5, 5, 2]]);
//f.popBlock();
//f.clearBlocks();
console.log(f);
