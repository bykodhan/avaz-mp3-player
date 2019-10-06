//Dosya seçim ekranı dialog modülü
const {dialog} = require('electron').remote;
//Dosya bilgileri için etiket modül(album,artist,vs.)
const NodeID3 = require('node-id3')
var title;
var filename;
var tags;

var table = document.getElementById("myTable");

filenames = JSON.parse(localStorage.getItem("filenames"));
paths = JSON.parse(localStorage.getItem("paths"));
titles = JSON.parse(localStorage.getItem("titles"));
//Eğer mp3ler varsa tablo oluştur
if(paths == null)
{
  var filenames = [];
  var paths = [];
  var titles = [];
}
else
{
  create_table();
}
//Dosya Seçim Butonu
document.querySelector('#selectBtn').addEventListener('click', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  }, function (files) {
    if (files !== undefined) {
        // Seçilen Dosya İşlemleri
        files.forEach(function(path,index) {
        filename = path.toString().replace(/^.*[\\\/]/, '');
        //Sadece mp3 uzantılı dosyaları ekle
        if(filename.search('.mp3') != -1)
        {
          tags = NodeID3.read(path);

          //başlık bilgisi yoksa dosya adını başlık yap
          if (tags.title !== undefined)
          {
            title = tags.title;
          }
          else{
            title = filename.toString().replace('.mp3','');
          }
          //Dizileri doldur
          filenames.push(filename);
          paths.push(path);
          titles.push(title);
        }
      });
        create_table();
    }
  });

});



var player = document.getElementById("player");
var range = document.getElementById("range");
var volume_range = document.getElementById("range-volume");
var current_time = document.getElementById("current-time");
var duration_time = document.getElementById("duration");
var play_button = document.getElementById("play-button");
var next_button = document.getElementById("next-button");
var previous_button = document.getElementById("previous-button");
var play_icon = document.getElementById("play-icon");
var suffle_icon = document.getElementById("shuffle-icon");
var repeat_icon = document.getElementById("repeat-icon");
var shuffle = false;
var repeat = false;
var mute = false;
var live_play_id=0;


// ex. 3:19
function formatTime(miliseconds)
{
  miliseconds = Math.floor(miliseconds);
  const h = Math.floor(miliseconds / 3600)
  const m = Math.floor((miliseconds % 3600) / 60)
  const s = miliseconds % 60
  return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
  .filter(a => a)
  .join(':')
};


function shuffle_control()
{
  if(shuffle==false)
  {
    shuffle=true;
    suffle_icon.setAttribute('src','./images/pngicons/shuffle2.png');
  }
  else{
    shuffle=false;
    suffle_icon.setAttribute('src','./images/pngicons/shuffle.png');
  }

}
function repeat_control()
{
  if(repeat==false)
  {
    repeat=true;
    repeat_icon.setAttribute('src','./images/pngicons/repeat2.png');
    player.loop=true;
  }
  else{
    repeat=false;
    repeat_icon.setAttribute('src','./images/pngicons/repeat.png');
    player.loop=false;

  }

}
function mute_control(){
  if(mute==false)
  {
    mute=true;
    volume_range.value = 0.0;
    player.volume = 0.0;
    document.getElementById('volume-img').setAttribute('src','./images/pngicons/mute.png')
  }
  else{
    mute=false;
    volume_range.value = 1.0;
    player.volume = 1.0;
    document.getElementById('volume-img').setAttribute('src','./images/pngicons/speaker.png')

  }
}

function delete_song() {
  player.pause();
  filenames.splice(live_play_id,1);
  paths.splice(live_play_id,1);
  titles.splice(live_play_id,1);

  create_table();
}
//tablo temizle
function all_delete(){
  while (table.hasChildNodes()) {
    table.removeChild(table.lastChild);
  }
  localStorage.setItem("filenames",null);
  localStorage.setItem("paths", null);
  localStorage.setItem("titles", null);
}
volume_range.onchange = function(){
  player.volume=volume_range.value;
};
player.ontimeupdate = function(){
  range.value=player.currentTime;
  current_time.innerHTML=formatTime(player.currentTime);
};
player.ondurationchange = function(){
  duration_time.innerHTML=formatTime(player.duration);
  range.setAttribute('max',Math.floor(player.duration));

};
range.onchange = function(){
  player.currentTime=range.value;
};

//Tabloda item seçildiğinde
function item_click(e){
  live_play_id = parseInt(e.target.getAttribute('id'));
  change_music(live_play_id);
}

play_button.onclick = function(){
  var status = player.paused;
  if(status == true)
  {
    player.play();
    play_icon.setAttribute('src','./images/pngicons/pause.png');
  }
  else
  {

    player.pause();
    play_icon.setAttribute('src','./images/pngicons/play.png');
  }
};
next_button.onclick = function(){
  change_music('next');
};

previous_button.onclick = function(){
  change_music('previous');
};

function change_music(next_or_previous){
  if(shuffle == false && repeat == false)
  {
    if(next_or_previous == 'next')
    {
      if(live_play_id<paths.length-1)
      {
        live_play_id += 1;
      }
    }
    else if(next_or_previous == 'previous'){
      if(live_play_id>0)
      {
        live_play_id -= 1;
      }
    }
    else if(next_or_previous == 'default'){
      live_play_id=0;
    }
    else{
      live_play_id = next_or_previous;
    }
  }
  else if(shuffle==true)
  {
    random = Math.floor(Math.random() * paths.length) + 0;
    if(random == live_play_id) //Eğer aynı şarkıdıysa tekrar random dene
    {
      random = Math.floor(Math.random() * paths.length) + 0;
      live_play_id=random;
    }
    else{
      live_play_id=random;
    }
  }
  player.setAttribute('src',document.getElementById(live_play_id).getAttribute('data-src'));
  player.play();
  play_icon.setAttribute('src','./images/pngicons/pause.png');
  sec();
}
//Çalan mp3 tabloda seç
function sec()
{
  var current = document.getElementsByClassName("bg-dark text-white active");
  if(document.getElementById(live_play_id).getAttribute('data-src') == player.getAttribute('src'))
  {

    if (current.length > 0) {
      current[0].className = current[0].className.replace('bg-dark text-white active', '');
    }

    document.getElementById(live_play_id).setAttribute('class','bg-dark text-white active');
  }
  document.getElementById('music-title').innerText=document.getElementById(live_play_id).getAttribute('title');
}

function create_table()
{
  table.innerHTML=null;

  for (var i = 0; i < paths.length; i++) {
    var newRow   = table.insertRow();
    var newCell1  = newRow.insertCell(0);
    var newText1  = document.createTextNode(filenames[i]);
    newCell1.setAttribute('data-src',paths[i]);
    newCell1.setAttribute('title',titles[i]);
    newCell1.setAttribute('id',i);
    newCell1.appendChild(newText1);
  }
  localStorage.setItem("filenames", JSON.stringify(filenames));
  localStorage.setItem("paths", JSON.stringify(paths));
  localStorage.setItem("titles", JSON.stringify(titles));
};

function search_song() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("search-input");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
};
