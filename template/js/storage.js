function getStorage() {
	var storageImpl;
	try { 
		localStorage.setItem("storage", ""); 
		localStorage.removeItem("storage");
		storageImpl = localStorage;
	}
	catch (err) { 
		storageImpl = new LocalStorageAlternative();
	}
	return storageImpl;
}

function LocalStorageAlternative() {
	var structureLocalStorage = {};

	this.setItem = function (key, value) {
		structureLocalStorage[key] = value;
	}
	this.getItem = function (key) {
		if(typeof structureLocalStorage[key] != 'undefined' ) {
			return structureLocalStorage[key];
		}
		else {
			return null;
		}
	}
	this.removeItem = function (key) {
		structureLocalStorage[key] = undefined;
	}
}
