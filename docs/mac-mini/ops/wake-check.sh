#!/bin/bash
# Read-only: scheduled wakes and the 4:45 Mando job.
pmset -g sched
launchctl list | grep -q com.kdtw.mando-morning && echo "Mando 4:45 job: loaded" || echo "Mando 4:45 job: not loaded"
