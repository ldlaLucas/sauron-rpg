// Iniciar jogo quando a página carregar
window.addEventListener('load', () => {
    const game = new Game();
    window.game = game;
    game.init();
});