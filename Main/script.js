const elprogress = document.getElementById('progress-value');
const elmstk = document.getElementById('mistakes');
const elslot = document.getElementsByClassName('slot');
const eltilesboard = document.querySelector('.tiles-board');
const eltileboard = document.getElementsByClassName('tile-board');
const elbtndif = document.getElementsByClassName('dif');
const elbtnhelp = document.getElementById('help');
///
// Flash = 48
// Easy = 38
// Medium = 30
// Hard = 28
// Expert = 25
let nDifficulty = 0;
let arrDifficulty = [48,38,30,28,25];
///
function removeClass(el,classname){
    for(const e of el){
        e.classList.remove(classname);
    }
}
////////////////////////////////////////////////////////////////
/// Generate Sudocu
function generateSudoku(){
    const sudoku = Array.from({length: 9}, ()=> Array(9).fill(0));
    function shuffle(arr) {
        for (let i=arr.length-1; i>0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function isValid(sudoku, row, col, num){
        for (let x=0; x<9; x++){
            if (sudoku[row][x] === num || sudoku[x][col] === num ||
                sudoku[3 * Math.floor(row / 3) + Math.floor(x / 3)]
                      [3 * Math.floor(col / 3) + x % 3] === num){
                return false;
            }
        }
        return true;
    }
    function setSudoku(sudoku) {
        for(let row=0; row<9; row++){
            for(let col=0; col<9; col++){
                if(sudoku[row][col] === 0){
                    const numbers = shuffle(Array.from({ length: 9 }, (_, i) => i + 1));
                    for(let num of numbers){
                        if(isValid(sudoku, row, col, num)){
                            sudoku[row][col] = num;
                            if(setSudoku(sudoku)){
                                return true;
                            }
                            sudoku[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    setSudoku(sudoku);
    return sudoku;
}
////////////////////////////////////////////////////////////////
/// Start Game
function startGame(){
    let audioClick = new Audio('media/click-2.mp3');
    audioClick.play();
    let audioMistake = new Audio('media/over.mp3');
    let slotNumber = 0;
    let slotPosLeft = 0;
    let slotPosTop = 0;
    let tilePosLeft = 0;
    let tilePosTop = 0;
    let mistakes = 0;
    let difficulty = arrDifficulty[nDifficulty];
    ///////////////////////////
    // Create board
    const arrSudoku = generateSudoku();
    const nslots = 9;
    for(var i=0;i<nslots;i++){
        var elrow = document.querySelectorAll('.row')[i];
        var arrow = arrSudoku[i];
        for(var j=0;j<nslots;j++){
            var elslotrow = elrow.getElementsByClassName('slot')[j];
            elslotrow.setAttribute('data-num',arrow[j]);
            elslotrow.addEventListener('click',selectSlot,false);
        }
    }
    ////////////////////////////////////
    // Progress
    function setProgress(){
        const step = 1.23;
        let nt = document.querySelectorAll('.tile').length * step;
        let pr = Math.round(nt);
        elprogress.style.width = pr+'%';
        if(pr >= 100){
            setTimeout(()=>{
                location.reload();
            },2000);
        }
    }
    ////////////////////////////////////
    // Set default Tile
    function setDefaultTile(){
        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }
        function generateUniqueArray(max,count){
            const uniqueNumbers = new Set();
            while(uniqueNumbers.size<count){
                uniqueNumbers.add(getRandomInt(max));
            }
            return Array.from(uniqueNumbers);
        }
        const max = 81;
        const uniqueArray = generateUniqueArray(max,difficulty);
        for(var u=0;u<uniqueArray.length;u++){
            let sl = document.getElementsByClassName('slot')[uniqueArray[u]];
            var slpos = sl.getBoundingClientRect();
            slotPosLeft = slpos.left;
            slotPosTop = slpos.top;
            var n = sl.dataset.num;
            createTile(n,'prog');
        }
        setProgress();
    }
    setDefaultTile();
    /////////////////////////////////////
    // Slots
    function removeClassActivSlot(){
        removeClass(elslot,'slot-selected');
        slotNumber = 0;
    }
    function selectSlot(){
        removeClassActivSlot();
        removeClassActivTiles();
        slotNumber = this.dataset.num;
        var slpos = this.getBoundingClientRect();
        slotPosLeft = slpos.left;
        slotPosTop = slpos.top;
        this.classList.add('slot-selected');
    }
    for(const el of eltileboard){
        el.addEventListener('click',selectTile,false);
    }
    function selectTile(){
        let n = this.dataset.num;
        if(slotNumber == 0){
            alert('1) Touch an empty slot...\n2)... and then touch a tile to place it on the slot');
            return false;
        }
        if(n == slotNumber){
            // Match
            var tilepos = this.getBoundingClientRect();
            tilePosLeft = tilepos.left;
            tilePosTop = tilepos.top;
            createTile(n,'user');
        }else{
            // Dont match
            audioMistake.play();
            mistakes++;
            var mstk = '';
            for(var i=0;i<mistakes;i++){
                mstk += '✘';
            }
            elmstk.innerHTML = mstk;
            elmstk.setAttribute('title','Mistakes: '+mistakes);
        }
    }
    // Create Tile
    function removeClassActivTiles(){
        let elt = document.getElementsByClassName('tile');
        removeClass(elt,'tile-active');
    }
    function createTile(n,who){
        var eltile = document.createElement('span');
        eltile.classList.add('tile', 'click','tile-'+n);
        eltile.setAttribute('data-num',n);
        eltile.innerHTML = n;
        eltile.style.left = tilePosLeft+'px';
        eltile.style.top = tilePosTop+'px';
        eltilesboard.append(eltile);
        //
        var ntle = document.querySelectorAll('.tile-'+n).length;
        if(ntle == 9){
            eltileboard[n-1].style.display = 'none';
        }
        if(who == 'user'){
            audioClick.play();
            setTimeout(()=>{
                eltile.style.left = slotPosLeft+'px';
                eltile.style.top = slotPosTop+'px';
                setProgress();
            },10);
            setTimeout(()=>{
                removeClassActivSlot();
            },500);
        }else{
            eltile.style.left = slotPosLeft+'px';
            eltile.style.top = slotPosTop+'px';
        }
        eltile.addEventListener('click',allTileNumber,false);
    }
    function allTileNumber(){
        removeClassActivTiles();
        let n = this.dataset.num;
        for(let el of document.querySelectorAll('.tile-'+n)){
            el.classList.add('tile-active');
        }
        removeClassActivSlot();
    }
    // Help
    elbtnhelp.addEventListener('click',getHelp,false);
    function getHelp(){
        if(slotNumber == 0){
            alert('1) Touch an empty slot...\n2)... and then touch the Help icon');
            return false;
        }else{
            document.querySelector('.slot-selected').innerHTML = slotNumber;
            elbtnhelp.setAttribute('disabled','1');
            elbtnhelp.style.opacity = '0.4';
            setTimeout(()=>{
                elbtnhelp.removeAttribute('disabled');
                elbtnhelp.style.opacity = '1';
            },180000);
        }
    }
}
window.onload = ()=>{
    document.body.classList.remove('loading');
    for(let i=0;i<elbtndif.length;i++){
        elbtndif[i].addEventListener('click',()=>{
            selDifficulty(i);
        },false);
    }
    function selDifficulty(i){
        nDifficulty = i;
        document.getElementById('menu').style.display = 'none';
        startGame();
    }
}