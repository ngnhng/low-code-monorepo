export enum FlowObjects {
   Trigger = "Trigger",
   Event = "Event",
   Activity = "Activity",
   Gateway = "Gateway",
}

export enum ConnectingObjects {
   SequenceFlow = "SequenceFlow",
   MessageFlow = "MessageFlow",
   Association = "Association",
}

export enum Swimlanes {
   Pool = "Pool",
   Lane = "Lane",
}

export enum Artifacts {
   DataObject = "DataObject",
   Group = "Group",
   Annotation = "Annotation",
}

export enum Conversations {
   ConversationNode = "ConversationNode",
   Conversation = "Conversation",
   CallConversation = "CallConversation",
}

export enum Choreography {
   ChoreographyTask = "ChoreographyTask",
   SubChoreography = "SubChoreography",
   ChoreographyCall = "ChoreographyCall",
}

export type BpmnElementCategory =
   | FlowObjects
   | ConnectingObjects
   | Swimlanes
   | Artifacts
   | Conversations
   | Choreography;
