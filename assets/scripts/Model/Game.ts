export namespace nGame{
	export class GameData{
		public static firstHandSeat : number = 255;
		public static currentTurn : number = 255;

		public static reset() : void{
			this.currentTurn = 255;
			this.firstHandSeat = 255;
		}
	}

}