document.addEventListener('DOMContentLoaded', function() {
	
	local_load(); 
	var notes = document.querySelectorAll(".note");
	for (var i = 0; i < notes.length; i++) {
		notes[i].addEventListener('click', edit_note);
	}
	
	document.querySelector("#grey_out").addEventListener('click', cancel_confirm);
	document.querySelector("#add").addEventListener('click', compose_note);
	document.querySelector('#input-title').onkeyup = disable_submit;
	document.querySelector('#compose-body').onkeyup = disable_submit;
});


function compose_note() {
	document.querySelector('#compose-submit').disabled = true;
	document.querySelector('#input-title').value = '';
	document.querySelector('#compose-body').value = '';
	document.querySelector('#compose-submit').value = "add a new note"; 
	on();
	document.querySelector('.form-container').onsubmit =  () => {

		var title = document.querySelector('#input-title').value.trim();
		var body = document.querySelector('#compose-body').value.trim();
		
		var new_title = document.createElement('div');
		var new_body = document.createElement('div');
		var new_note = document.createElement('div');

		new_title.className = "title";
		new_body.className = "body";
		new_note.className = "note";
		
		new_title.innerHTML = title;
		new_body.innerHTML = body;
		
		new_note.appendChild(new_title);
		new_note.appendChild(new_body);
		new_note.addEventListener('click', compose_note);
		
		var container = document.querySelector('#container');
		
		if (document.querySelector('#container').childNodes.length > 0) {
			latest_id = document.querySelector('#container').childNodes[0].id;
			new_note.id = `note${Number(latest_id.slice(4, latest_id.length))+1}`;			
		} else{
			new_note.id = 'note1'; 
		}
		
		new_note.addEventListener('click', edit_note);
		container.insertBefore(new_note, container.childNodes[0]);
		
		local_store(new_note.id, title, body, false); 
		
		off();
		return false;
	};
}

function load_notes() {
	document.querySelector('#notes').style.display = 'block';
	document.querySelector('#edit_note').style.display = 'none';
}	

function create_note() {
	document.querySelector('#notes').style.display = 'none';
	document.querySelector('#edit_note').style.display = 'block';
}

function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
  document.querySelector('#delete').style.display = "none"; 
}

function edit_note(){
	var id = this.id;
	console.log("edit", id); 
	document.querySelector('#compose-submit').disabled = true;
	document.querySelector('#input-title').value = this.querySelector(".title").innerHTML;
	document.querySelector('#compose-body').value = this.querySelector(".body").innerHTML;
	document.querySelector('#compose-submit').value = "apply change"; 
	document.querySelector('#compose-submit').disabled = true; 
	document.querySelector('#delete').style.display = "initial"; 
	document.querySelector('#delete').name = id; 
	
	document.querySelector('#delete').onclick =  () => {
		var notes = JSON.parse(localStorage.notes);
		delete_note(notes, id);
		}
		
	on();
	
	document.querySelector('.form-container').onsubmit =  () => {
		var title = document.querySelector('#input-title').value.trim();
		var body = document.querySelector('#compose-body').value.trim();
		document.querySelector(`#${id}`).querySelector(".title").innerHTML = title;
		document.querySelector(`#${id}`).querySelector(".body").innerHTML = body;		
		off();
		console.log(id, title, body); 
		local_store(id, title, body, true); 
		return false;
	};
}  

function disable_submit() {
	var title = document.querySelector('#input-title').value.trim();
	var body = document.querySelector('#compose-body').value.trim();
	if (title == '' && body == '') {
		document.querySelector('#compose-submit').disabled = true; 
	} else {
		document.querySelector('#compose-submit').disabled = false; 
	} 			
}


// call this function when a new note created or note editted
function local_store(note_id, title, body, is_edit) {
	console.log(`local_store(${note_id}, ${title},${body}, ${is_edit})`);
	if (typeof(Storage) !== "undefined") {
		if (localStorage.notes) {
			console.log('localStorage exists');
			var notes = JSON.parse(localStorage.notes);
			console.log(notes);  
			if (is_edit) {
				var i;
				for (i = 0; i < notes.length; i++){
					console.log("for loop", notes[i].note_id); 
					console.log("caught?", notes[i].note_id == note_id); 
					if (notes[i].note_id == note_id) {
						console.log("caught"); 
						notes[i] = {"note_id":note_id, "title":title, "body": body}; 
						localStorage.notes = JSON.stringify(notes); 
						break;
					}
				}
			}	else{
				notes[notes.length] = {"note_id":note_id, "title":title, "body": body}; 
				localStorage.notes = JSON.stringify(notes); 
				console.log(localStorage.notes); 
				// stringify for saving, parse after retrieving 
			}
			
		} else {
			console.log('localStorage NOT exists');
			localStorage.notes= JSON.stringify([{"note_id":note_id, "title":title, "body": body}]);	
		}
		
	} else {
	document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
	}	
}

//call this function upon refresh or a note created/editted 
function local_load(){
	if (typeof(Storage) !== "undefined") {
		if (localStorage.notes) {
			console.log('localStorage exists');
			var notes = JSON.parse(localStorage.notes);
			console.log(notes);  

			// notes[notes.length] = {"note_id":note_id, "title":title, "body": body}; 
			var i;
			for (i = 1; i < notes.length+1; i++){
				var title = notes[notes.length-i].title; 
				var body = notes[notes.length-i].body; 
				
				var new_title = document.createElement('div');
				var new_body = document.createElement('div');
				var new_note = document.createElement('div');

				new_title.className = "title";
				new_body.className = "body";
				new_note.className = "note";
				
				new_title.innerHTML = title;
				new_body.innerHTML = body;
				
				new_note.appendChild(new_title);
				new_note.appendChild(new_body);
				new_note.addEventListener('click', compose_note);
				
				var container = document.querySelector('#container');
				new_note.id = notes[notes.length-i].note_id; 
				new_note.addEventListener('click', edit_note);
				container.appendChild(new_note);
			}
		} else {
			// document.getElementById("container").innerHTML = "There is no note to show...";
		}
	} else {
	document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
	}	
}	

function delete_note(notes, note_id){
	var i;
	for ( i = 0; i < notes.length; i++) {
		if (notes[i].note_id == note_id) {
			console.log(notes[i]); 
			delete notes[i];
			// remove null elements from the array 
			notes = notes.filter((x) => {return x !== null});
			localStorage.notes = JSON.stringify(notes); 
			console.log("to be deleted:", note_id); 
			location.reload();
			break; 
		}
	}
}

function cancel_confirm() {
  var txt;
  if (confirm("leave without saving changes?")) {
	off()
  }
 
}