const grid = document.getElementById("gameGrid");

games.forEach(game => {

    grid.innerHTML += `

    <div class="game-card">

        <div class="slot">
            <img src="assets/cartridges/slot.svg">
        </div>

        <div class="cartridge">

            <img class="label" src="${game.image}">

            <img class="frame"
                 src="assets/cartridges/retroholic-frame.svg">

        </div>

        <div class="pcb">
            <img src="assets/cartridges/pcb.svg">
        </div>

        <div class="game-info">

            <h3>${game.title}</h3>

            <p>
                ${game.genre}<br>
                ${game.year}
            </p>

        </div>

    </div>

    `;

});