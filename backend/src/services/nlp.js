// NLP service using chrono-node for date parsing
const chrono = require("chrono-node");

/**
 * Extract task details from transcript
 * - chrono-node for date parsing ("tomorrow", "next Monday", etc.)
 * - Regex for priority and status detection
 */
exports.extractTaskDetails = (transcript) => {
    const text = transcript.toLowerCase();

    // Extract due date using chrono-node
    const parsedDate = chrono.parseDate(transcript);
    let dueDate = null;
    if (parsedDate) {
        dueDate = Math.floor(parsedDate.getTime() / 1000); // Unix timestamp
    }

    // Extract priority (check LOW first to handle "not critical", "not urgent" etc.)
    let priority = "MEDIUM"; // default
    if (text.includes("not critical") || text.includes("not urgent") || text.includes("not important") || 
        text.includes("low priority") || text.includes("whenever") || text.includes("no rush")) {
        priority = "LOW";
    } else if (text.includes("high priority") || text.includes("urgent") || text.includes("important") || 
               text.includes("critical") || text.includes("asap")) {
        priority = "HIGH";
    }

    // Extract status
    let status = "TODO"; // default
    if (text.includes("in progress") || text.includes("working on") || text.includes("started")) {
        status = "IN_PROGRESS";
    } else if (text.includes("done") || text.includes("completed") || text.includes("finished")) {
        status = "DONE";
    }

    // Clean up the title - remove date phrases, priority phrases, etc.
    let title = transcript
        // Remove common task prefixes
        .replace(/^(create a task|add a task|new task|task|remind me|reminder)\s*(to|for|about)?\s*/i, "")
        // Remove priority phrases (including "It's high priority", "This is critical", etc.)
        .replace(/\b(it'?s |this is |that'?s )?(a )?(very )?(high|low|medium) priority\.?/gi, "")
        .replace(/\b(it'?s |this is |that'?s )?(very )?(not )?(urgent|important|critical|asap|no rush|whenever)\.?/gi, "")
        // Remove status phrases
        .replace(/\b(it'?s |this is )?(in progress|working on|started|done|completed|finished)\.?/gi, "")
        // Remove date phrases with "by/on/before next/this" patterns
        .replace(/\b(by |due |before |on |until |for )?(next |this )?(tomorrow|today|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\.?/gi, "")
        .replace(/\b(by |due |before |on |until )?\d{1,2}(st|nd|rd|th)?\s*(of\s*)?(january|february|march|april|may|june|july|august|september|october|november|december)?\s*\d{0,4}\.?/gi, "")
        // Remove orphaned sentence starters left behind
        .replace(/\.\s*(it'?s|this is|that'?s)\s*\.?\s*$/gi, "")
        // Remove trailing punctuation patterns like ". ." or "..."
        .replace(/[\s.]+$/g, "")
        // Remove orphaned "by" or "on" at the end
        .replace(/\s+(by|on|before|until|for|next|this)\s*\.?\s*$/gi, "")
        // Clean up multiple spaces
        .replace(/\s+/g, " ")
        // Clean up multiple periods
        .replace(/\.+/g, ".")
        // Remove leading/trailing punctuation and spaces
        .replace(/^[\s.,!?]+|[\s.,!?]+$/g, "")
        .trim();

    // Capitalize first letter
    if (title.length > 0) {
        title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    // If title is too short or empty, use the original transcript
    if (title.length < 3) {
        title = transcript.charAt(0).toUpperCase() + transcript.slice(1);
    }

    return {
        title,
        description: "",
        priority,
        status,
        dueDate,
        rawTranscript: transcript
    };
};

