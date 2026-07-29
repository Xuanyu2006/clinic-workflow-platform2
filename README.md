                    status: "Confirmed",
                  })
                }
              >
                Mark complete
              </Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function MessagingPanel({
  appointments,
  messages,
  messageDraft,
  setMessageDraft,
  sendMessage,
}: {
  appointments: Appointment[];
  messages: Message[];
  messageDraft: string;
  setMessageDraft: Dispatch<SetStateAction<string>>;
  sendMessage: (patient: string, body?: string) => void;
}) {
  const [selectedPatient, setSelectedPatient] = useState("");

  return (
    <Panel
      title="Patient Messaging"
      description="Send lightweight operational messages from the front desk."
    >
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="grid gap-3">
          <Field label="Patient">
            <select
              className={inputClassName}
              disabled={appointments.length === 0}
              value={selectedPatient}
              onChange={(event) => setSelectedPatient(event.target.value)}
            >
              <option value="">Select patient</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.patient}>
                  {appointment.patient}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Message">
            <textarea
              className="min-h-32 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Write patient message"
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
            />
          </Field>
          <Button onClick={() => sendMessage(selectedPatient)}>Send message</Button>
        </div>

        <div className="max-h-[420px] overflow-auto rounded-lg border border-border">
          {messages.length === 0 ? (
            <div className="p-4">
              <EmptyState message="No messages have been sent yet." />
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="border-b border-border p-4 last:border-b-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{message.patient}</p>
                  <p className="text-xs text-muted-foreground">
                    {message.sender} - {message.time}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {message.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}

function InsurancePanel({
  appointments,
  updateAppointment,
}: {
  appointments: Appointment[];
  updateAppointment: (
    id: string,
    updates: Partial<Omit<Appointment, "id">>,
  ) => void;
}) {
  return (
    <Panel
      title="Insurance Verification"
      description="Review coverage status before visits and resolve issues earlier."
    >
      {appointments.length === 0 ? (
        <EmptyState message="No insurance checks are queued because no appointments have been added yet." />
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="grid gap-4 rounded-lg border border-border p-4 lg:grid-cols-[1fr_140px_auto_auto]"
            >
              <div>
                <p className="font-medium">{appointment.patient}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.id} - {appointment.reason}
                </p>
              </div>
              <StatusBadge value={appointment.insuranceStatus} />
              <Button
                variant="secondary"
                onClick={() =>
                  updateAppointment(appointment.id, {
                    insuranceStatus: "Pending",
                  })
                }
              >
                Recheck
              </Button>
              <Button
                onClick={() =>
                  updateAppointment(appointment.id, {
                    insuranceStatus: "Verified",
                  })
                }
              >
                Verify
              </Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
