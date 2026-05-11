// Shared Human Timing Floor (HTF) module

// Enforces that the time between consecutive moves is at least 300ms.
// The `timestamps` array is padded with 0s after `valid_count`.
pub fn enforce_htf<let N: u32>(timestamps: [u64; N], valid_count: u32) {
    for i in 1..N {
        if i < valid_count {
            let interval = timestamps[i] - timestamps[i - 1];
            assert(interval >= 300, "Human Timing Floor violation: interval < 300ms");
        }
    }
}

#[test]
fn test_htf_valid() {
    let timestamps = [1000, 1350, 1800, 2200, 0, 0];
    enforce_htf(timestamps, 4);
}

#[test(should_fail)]
fn test_htf_invalid() {
    // Second interval is 200ms
    let timestamps = [1000, 1200, 1800, 2200, 0, 0];
    enforce_htf(timestamps, 4);
}
