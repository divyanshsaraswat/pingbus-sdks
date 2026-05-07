package pingbus

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"math"
	"math/rand"
	"time"
)

func VerifySignature(body, signature, apiKey string) bool {
	h := hmac.New(sha256.New, []byte(apiKey))
	h.Write([]byte(body))
	expected := hex.EncodeToString(h.Sum(nil))
	
	return subtle.ConstantTimeCompare([]byte(signature), []byte(expected)) == 1
}

func GetWaitTime(attempt int) time.Duration {
	initialDelay := 1000 * time.Millisecond
	maxDelay := 30000 * time.Millisecond
	backoffFactor := 2.0
	jitter := 1000 * time.Millisecond

	delay := float64(initialDelay) * math.Pow(backoffFactor, float64(attempt))
	if delay > float64(maxDelay) {
		delay = float64(maxDelay)
	}

	randomJitter := time.Duration(rand.Int63n(int64(jitter)))
	return time.Duration(delay) + randomJitter
}
