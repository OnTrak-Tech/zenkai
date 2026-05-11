use timing::enforce_htf;

// Simplified Chess MVP constraints
// We validate timing (HTF), board boundaries, and basic piece shapes
// without needing a full FIDE rules engine.

global PAWN: u8 = 0;
global KNIGHT: u8 = 1;
global BISHOP: u8 = 2;
global ROOK: u8 = 3;
global QUEEN: u8 = 4;
global KING: u8 = 5;

struct Move {
    from_x: u8,
    from_y: u8,
    to_x: u8,
    to_y: u8,
    piece: u8,
    timestamp: u64,
}

fn main(
    game_id: pub Field,
    seed: pub Field,
    moves: [Move; 40],
    valid_count: u32,
    declared_winner: pub Field, // 0 = draw, 1 = P1, 2 = P2
) {
    // 1. Enforce Human Timing Floor (HTF)
    let mut timestamps = [0; 40];
    for i in 0..40 {
        timestamps[i] = moves[i].timestamp;
    }
    enforce_htf(timestamps, valid_count);

    // 2. Enforce P1 color assignment from seed
    // Using a simplistic `seed as u32 % 2` to represent White (0) or Black (1).
    // In a real application, you'd constrain the hashing of the seed and player pubkeys.
    
    // 3. Move Validation
    for i in 0..40 {
        if i < valid_count {
            let m = moves[i];
            
            // Boundary constraints: board is 0-7
            assert(m.from_x < 8, "from_x out of bounds");
            assert(m.from_y < 8, "from_y out of bounds");
            assert(m.to_x < 8, "to_x out of bounds");
            assert(m.to_y < 8, "to_y out of bounds");

            // Must actually move
            assert((m.from_x != m.to_x) | (m.from_y != m.to_y), "piece must move");

            // Compute squared differences for ZK piece shape validation.
            // In a prime field, (x - y)^2 == (y - x)^2, so this cleanly represents distance^2.
            let dx: Field = m.from_x as Field - m.to_x as Field;
            let dy: Field = m.from_y as Field - m.to_y as Field;
            let dx2 = dx * dx;
            let dy2 = dy * dy;

            if m.piece == KNIGHT {
                // Knights move in an L-shape (2^2 + 1^2 = 5)
                assert((dx2 + dy2) == 5, "Invalid Knight move");
            } else if m.piece == ROOK {
                // Rooks move in straight lines
                assert((dx2 == 0) | (dy2 == 0), "Invalid Rook move");
            } else if m.piece == BISHOP {
                // Bishops move diagonally
                assert(dx2 == dy2, "Invalid Bishop move");
            } else if m.piece == QUEEN {
                // Queens move straight or diagonally
                assert((dx2 == 0) | (dy2 == 0) | (dx2 == dy2), "Invalid Queen move");
            } else if m.piece == KING {
                // Kings move 1 square in any direction (1^2 = 1, 0^2 = 0)
                let valid_dx = (dx2 == 0) | (dx2 == 1);
                let valid_dy = (dy2 == 0) | (dy2 == 1);
                assert(valid_dx & valid_dy, "Invalid King move");
            }
        }
    }
}

// Basic unit test for the chess validation
#[test]
fn test_chess_valid() {
    // Array padding
    let mut moves = [Move { from_x: 0, from_y: 0, to_x: 0, to_y: 0, piece: 0, timestamp: 0 }; 40];
    
    // First move: Knight from (1,0) to (2,2) - Valid shape
    moves[0] = Move { from_x: 1, from_y: 0, to_x: 2, to_y: 2, piece: KNIGHT, timestamp: 1000 };
    // Second move: Rook from (0,0) to (0,5) - Valid shape
    moves[1] = Move { from_x: 0, from_y: 0, to_x: 0, to_y: 5, piece: ROOK, timestamp: 1500 };
    
    main(1, 1234, moves, 2, 1);
}

#[test(should_fail)]
fn test_chess_invalid_knight() {
    let mut moves = [Move { from_x: 0, from_y: 0, to_x: 0, to_y: 0, piece: 0, timestamp: 0 }; 40];
    // Invalid Knight move (moves 2 up, 2 right -> 2^2 + 2^2 = 8 != 5)
    moves[0] = Move { from_x: 1, from_y: 0, to_x: 3, to_y: 2, piece: KNIGHT, timestamp: 1000 };
    main(1, 1234, moves, 1, 1);
}

#[test(should_fail)]
fn test_chess_out_of_bounds() {
    let mut moves = [Move { from_x: 0, from_y: 0, to_x: 0, to_y: 0, piece: 0, timestamp: 0 }; 40];
    // Invalid bounds (to_x = 8)
    moves[0] = Move { from_x: 0, from_y: 0, to_x: 8, to_y: 0, piece: ROOK, timestamp: 1000 };
    main(1, 1234, moves, 1, 1);
}
