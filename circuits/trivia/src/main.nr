use timing::enforce_htf;

struct Answer {
    question_id: u32,
    is_correct: bool,
    timestamp: u64,
}

fn main(
    game_id: pub Field,
    seed: pub Field,
    p1_answers: [Answer; 10],
    p2_answers: [Answer; 10],
    p1_valid_count: u32,
    p2_valid_count: u32,
    declared_score_p1: pub u32,
    declared_score_p2: pub u32,
) {
    // 1. Enforce Human Timing Floor (HTF) for P1
    let mut p1_timestamps = [0; 10];
    for i in 0..10 {
        p1_timestamps[i] = p1_answers[i].timestamp;
    }
    // HTF parameter size is generic now, but our library was compiled for a specific generic size.
    // Actually, `enforce_htf` uses a generic N. So it will adapt to 10 here.
    enforce_htf(p1_timestamps, p1_valid_count);

    // 2. Enforce HTF for P2
    let mut p2_timestamps = [0; 10];
    for i in 0..10 {
        p2_timestamps[i] = p2_answers[i].timestamp;
    }
    enforce_htf(p2_timestamps, p2_valid_count);

    // 3. Verify Score Calculation
    let mut computed_score_p1: u32 = 0;
    for i in 0..10 {
        if (i < p1_valid_count) & (p1_answers[i].is_correct) {
            computed_score_p1 += 1;
        }
    }
    assert(computed_score_p1 == declared_score_p1, "P1 declared score mismatch");

    let mut computed_score_p2: u32 = 0;
    for i in 0..10 {
        if (i < p2_valid_count) & (p2_answers[i].is_correct) {
            computed_score_p2 += 1;
        }
    }
    assert(computed_score_p2 == declared_score_p2, "P2 declared score mismatch");
    
    // In a full implementation, we would derive the `question_id` sequence
    // securely from the `seed` to ensure neither player manipulated the question order.
}

#[test]
fn test_trivia_valid() {
    let mut p1_answers = [Answer { question_id: 0, is_correct: false, timestamp: 0 }; 10];
    p1_answers[0] = Answer { question_id: 1, is_correct: true, timestamp: 1000 };
    p1_answers[1] = Answer { question_id: 2, is_correct: true, timestamp: 1500 };
    
    let mut p2_answers = [Answer { question_id: 0, is_correct: false, timestamp: 0 }; 10];
    p2_answers[0] = Answer { question_id: 1, is_correct: true, timestamp: 1000 };
    p2_answers[1] = Answer { question_id: 2, is_correct: false, timestamp: 1400 };

    // P1 score: 2, P2 score: 1
    main(1, 1234, p1_answers, p2_answers, 2, 2, 2, 1);
}

#[test(should_fail)]
fn test_trivia_invalid_score() {
    let mut p1_answers = [Answer { question_id: 0, is_correct: false, timestamp: 0 }; 10];
    p1_answers[0] = Answer { question_id: 1, is_correct: true, timestamp: 1000 };
    
    let mut p2_answers = [Answer { question_id: 0, is_correct: false, timestamp: 0 }; 10];
    p2_answers[0] = Answer { question_id: 1, is_correct: true, timestamp: 1000 };

    // P1 score computed is 1, but declared as 5. This should fail.
    main(1, 1234, p1_answers, p2_answers, 1, 1, 5, 1);
}
