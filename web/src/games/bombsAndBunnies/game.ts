import { Ctx, Game } from 'boardgame.io';

import { IG, IPlayer, CardType, CardStyle, Phases } from './engine/interfaces'
import * as Moves from './engine/moves';
import * as StateExtensions from './engine/stateExtensions'

export const BombsAndBunniesGame: Game<IG> = {
  name: 'bombsAndBunnies',

  phases: {
    initial_placement: {
      start: true,

      turn: {
        moveLimit: 1,
        order: {
          first: (G: IG, ctx: Ctx) => {
            if (G.bombPlayerId !== null && !StateExtensions.getPlayerById(G, G.bombPlayerId).isOut) {
              return ctx.playOrder.findIndex((id) => id === G.bombPlayerId);
            }

            if (G.lastWinningPlayerId !== null) {
              var winningPlayerIndex = ctx.playOrder.findIndex((id) => id === G.lastWinningPlayerId);
              return (winningPlayerIndex + 1) % ctx.playOrder.length;
            }

            return ctx.playOrderPos;
          },
          next: (G: IG, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
          playOrder: StateExtensions.getPlayOrder,
        },
      },

      moves: {
        MovePlaceCard: Moves.PlaceCard,
      },
      next: Phases.place_or_bet,

      endIf: (G: IG) => StateExtensions.hasInitialPlacementFinished(G),

      onEnd: (G: IG) => {
        G.bombPlayerId = null;
        G.failedRevealPlayerId = null;
        G.lastWinningPlayerId = null;
      },
    },

    place_or_bet: {
      turn: {
        moveLimit: 1,
        order: {
          first: (G: IG, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
          next: (G: IG, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
          playOrder: StateExtensions.getPlayOrder,
        },
      },

      moves: {
        MovePlaceCard: Moves.PlaceCard,
        MoveBet: Moves.Bet,
      },

      endIf: (G: IG, ctx: Ctx) => {
        const player = StateExtensions.getPlayerById(G, ctx.currentPlayer);
        const currentPlayerBet = player.bet;
        const endPhase = currentPlayerBet !== null;
        if (endPhase) {
          const isMaxBet = currentPlayerBet === StateExtensions.getMaxPossibleBet(G);
          return {
            next: isMaxBet ? Phases.reveal : Phases.bet,
          };
        }
      },
    },

    bet: {
      turn: {
        moveLimit: 1,
        order: {
          first: (G: IG, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
          next: (G: IG, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
          playOrder: StateExtensions.getPlayOrder,
        },
      },

      moves: {
        MoveBet: Moves.Bet,
        MoveSkipBet: Moves.SkipBet,
      },

      next: Phases.reveal,
    },

    reveal: {
      turn: {
        order: {
          first: (G: IG, ctx: Ctx) => ctx.playOrder.findIndex((id) => id === StateExtensions.getPlayerWithMaxBet(G).id),
          next: (G: IG, ctx: Ctx) => ctx.playOrderPos,
          playOrder: StateExtensions.getPlayOrder,
        },
      },

      moves: {
        MoveReveal: Moves.Reveal,
      },

      next: Phases.initial_placement,

      onEnd: (G: IG) => {
        StateExtensions.pickUpHand(G);
        StateExtensions.resetBets(G);
      },
    },

    penalty: {
      turn: {
        order: {
          first: (G: IG, ctx: Ctx) => ctx.playOrder.findIndex((id) => id === G.bombPlayerId),
          next: (G: IG, ctx: Ctx) => ctx.playOrderPos,
          playOrder: StateExtensions.getPlayOrder,
        },
      },

      moves: {
        MoveDiscard: Moves.Discard,
      },

      next: Phases.initial_placement,
    },
  },

  endIf: (G: IG) => {
    const winner = StateExtensions.findWinner(G);
    if (winner !== undefined) {
      return { winner: winner.id };
    }
  },

  setup: (ctx: Ctx): IG => {
    let players: IPlayer[] = new Array(ctx.numPlayers).fill(0).map((_, i) => ({
      id: i.toString(),
      cardStyle: <CardStyle>i,
      bet: null,
      betSkipped: false,
      hand: [CardType.Bunny, CardType.Bunny, CardType.Bunny, CardType.Bomb],
      stack: [],
      revealedStack: [],
      wins: 0,
      isOut: false,
    }));

    return {
      players: players,
      minBet: 1,
      maxBet: 0,
      currentBet: 0,
      bombPlayerId: null,
      failedRevealPlayerId: null,
      lastWinningPlayerId: null,
      discardPile: [],
    };
  },
};
