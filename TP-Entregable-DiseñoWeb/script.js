const url = 'https://api.restful-api.dev/objects';

window.onload = function () {
    $('#popUp').hide();
    getObjects();
};

//PROMESAS//

function loadObjects() {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'json';
        request.onload = () => {
            if (request.status === 200) {
                resolve(request.response);
            } else {
                reject(new Error(request.statusText));
            }
        };
        request.onerror = () => {
            reject(new Error('Error: unexpected network error.'));
        };
        request.send();
    });
}

function addObject() {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('POST', url);
        request.setRequestHeader('Content-Type', 'application/json');
        const data = JSON.stringify({
            color: document.getElementById('color').value,
            price: document.getElementById('price').value
        });
        const object = JSON.stringify({
            name: document.getElementById('name').value,
            data: data
        });
        request.onload = () => {
            if (request.status === 200) {
                resolve(request.response);
            } else {
                reject(new Error(request.statusText));
            }
        };
        request.onerror = () => {
            reject(new Error('Error: unexpected network error.'));
        };
        request.send(object);
    });
}

function removeObject(id) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('DELETE', `${url}/${id}`);
        request.onload = () => {
            if (request.status === 200) {
                resolve(request.response);
            } else {
                reject(new Error(request.statusText));
            }
        };
        request.onerror = () => {
            reject(new Error('Error: unexpected network error.'));
        };
        request.send();
    });
}

function modifyObject() {
    return new Promise((resolve, reject) => {
        const id = document.getElementsByName('id2')[0].value;
        const request = new XMLHttpRequest();
        request.open('PUT', `${url}/${id}`);
        request.setRequestHeader('Content-Type', 'application/json');
        const data = JSON.stringify({
            color: document.getElementsByName('color2')[0].value,
            price: document.getElementsByName('price2')[0].value
        });
        const object = JSON.stringify({
            name: document.getElementsByName('name2')[0].value,
            data: data
        });
        request.onload = () => {
            if (request.status === 200) {
                resolve(request.response);
            } else {
                reject(new Error(request.statusText));
            }
        };
        request.onerror = () => {
            reject(new Error('Error: unexpected network error.'));
        };
        request.send(object);
    });
}

//FUNCIONES QUE CONSUMEN LAS PROMESAS//

function getObjects() {
    loadObjects()
        .then(response => {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = '';
            response.forEach(object => {
                if (object.data !== null && 'color' in object.data && 'price' in object.data) {
                    insertTr(object, false);
                }
            });
        })
        .catch(reason => console.error(reason));
}

function saveObject() {
    const name = document.getElementById('name').value.trim();
    const color = document.getElementById('color').value.trim();
    const price = document.getElementById('price').value.trim();

    if (name !== '' && color !== '' && price !== '') {
        addObject()
            .then(response => {
                const object = JSON.parse(response);
                const data = JSON.parse(object.data);
                object.data = data;
                insertTr(object, true);
            })
            .catch(reason => console.error(reason));
    }
}

function deleteObject(object) {
    removeObject(object.id)
        .then(() => {
            const rows = document.querySelectorAll('tr');
            rows.forEach(row => {
                if (row.getAttribute('id') === object.id) {
                    row.remove();
                    clearInputs();
                }
            });
        })
        .catch(reason => console.error(`Error en deleteObject: ${reason}`));
}

function updateObject() {
    const id = document.getElementsByName('id2')[0].value.trim();
    const name = document.getElementsByName('name2')[0].value.trim();
    const color = document.getElementsByName('color2')[0].value.trim();
    const price = document.getElementsByName('price2')[0].value.trim();

    if (id !== '' && name !== '' && color !== '' && price !== '') {
        modifyObject()
            .then(() => {
                const rows = document.querySelectorAll('tr');
                rows.forEach(row => {
                    if (row.getAttribute('id') === id) {
                        row.cells[1].textContent = name;
                        row.cells[2].textContent = color;
                        row.cells[3].textContent = price;

                        const updatedObject = {
                            id: id,
                            name: name,
                            data: JSON.stringify({
                                color: color,
                                price: price
                            })
                        };

                        row.cells[4].innerHTML = `<button onclick='viewObject(${JSON.stringify(updatedObject)})'>VIEW</button>`;
                        row.cells[5].innerHTML = `<button onclick='deleteObject(${JSON.stringify(updatedObject)})'>DELETE</button>`;
                    }
                });
                $('#popUp').dialog('close');
                clearInputs();
            })
            .catch(reason => console.error(reason));
    }
}

//FUNCIONES DE AGREGADO//

function insertTr(object, canChange) {
    const tbody = document.querySelector('tbody');
    const row = tbody.insertRow();
    row.setAttribute('id', object.id);
    row.insertCell().textContent = object.id;
    row.insertCell().textContent = object.name;
    row.insertCell().textContent = object.data.color;
    row.insertCell().textContent = object.data.price;

    if (canChange) {
        row.insertCell().innerHTML = `<button onclick='viewObject(${JSON.stringify(object)})'>VIEW</button>`;
        row.insertCell().innerHTML = `<button onclick='deleteObject(${JSON.stringify(object)})'>DELETE</button>`;
    }

    clearInputs();
}


function viewObject(object) {
    console.log('Objeto pasado a viewObject:', object);
    try {
        // Ya es un objeto, no es necesario usar JSON.parse
        const data = object.data; 

        document.getElementById('id2').value = object.id;
        document.getElementById('name2').value = object.name;
        document.getElementById('color2').value = data.color;
        document.getElementById('price2').value = data.price;

        $('#popUp').dialog({ closeText: '' }).css('font-size', '15px');
    } catch (error) {
        console.error('Error en viewObject:', error);
    }
}


function clearInputs() {
    document.getElementById('name').value = '';
    document.getElementById('color').value = '';
    document.getElementById('price').value = '';
    document.getElementById('name').focus();
}
