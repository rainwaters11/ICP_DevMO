import List "mo:base/List";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Order "mo:base/Order";
import Nat "mo:base/Nat";

actor {
  type Task = {
    id: Nat;
    description: Text;
    completed: Bool;
    timestamp: Int;
    dueDate: Int;
  };
  
  var tasks : List.List<Task> = List.nil();
  var nextId : Nat = 0;
  
  // ✅ Create test task with custom due time
  public func addTestTask(description: Text, dueInSeconds: Nat) : async Nat {
    let dueDate = Time.now() + (dueInSeconds * 1_000_000_000);
    let task: Task = {
      id = nextId;
      description = description;
      completed = false;
      timestamp = Time.now();
      dueDate = dueDate;
    };
    tasks := List.push(task, tasks);
    nextId += 1;
    return task.id;
  };
  
  // ✅ Edit task description by ID
  public func editTaskDescription(id: Nat, newDescription: Text): async Bool {
    func update(lst: List.List<Task>, acc: List.List<Task>, found: Bool): (List.List<Task>, Bool) {
      switch lst {
        case null { (List.reverse(acc), found) };
        case (?(head, tail)) {
          if (head.id == id) {
            let updated: Task = {
              id = head.id;
              description = newDescription;
              completed = head.completed;
              timestamp = head.timestamp;
              dueDate = head.dueDate;
            };
            update(tail, List.push(updated, acc), true);
          } else {
            update(tail, List.push(head, acc), found);
          };
        };
      };
    };
    let result = update(tasks, List.nil(), false);
    tasks := result.0;
    return result.1;
  };
  
  // Get all tasks
  public query func getTasks() : async [Task] {
    return List.toArray(tasks);
  };
  
  // Get tasks sorted by due date
  public query func getTasksSortedByDueDate() : async [Task] {
    let array = List.toArray(tasks);
    return Array.sort<Task>(array, func(a: Task, b: Task) : Order.Order {
      if (a.dueDate < b.dueDate) return #less;
      if (a.dueDate > b.dueDate) return #greater;
      #equal;
    });
  };
  
  // Get overdue tasks
  public query func getOverdueTasks() : async [Task] {
    let now = Time.now();
    let overdue = List.filter<Task>(tasks, func (task) {
      not task.completed and task.dueDate < now
    });
    return List.toArray(overdue);
  };
  
  // Get incomplete tasks
  public query func getIncompleteTasks() : async [Task] {
    let incomplete = List.filter<Task>(tasks, func (task) {
      not task.completed
    });
    return List.toArray(incomplete);
  };
  
  // Get completed tasks
  public query func getCompletedTasks() : async [Task] {
    let completed = List.filter<Task>(tasks, func (task) {
      task.completed
    });
    return List.toArray(completed);
  };
  
  // Complete a task
  public func completeTask(id: Nat): async Bool {
    func updateTasks(lst: List.List<Task>, acc: List.List<Task>, found: Bool): (List.List<Task>, Bool) {
      switch lst {
        case null { (List.reverse(acc), found) };
        case (?(head, tail)) {
          if (head.id == id) {
            let updatedTask: Task = {
              id = head.id;
              description = head.description;
              completed = true;
              timestamp = head.timestamp;
              dueDate = head.dueDate;
            };
            updateTasks(tail, List.push(updatedTask, acc), true);
          } else {
            updateTasks(tail, List.push(head, acc), found);
          };
        };
      };
    };
    let result = updateTasks(tasks, List.nil(), false);
    tasks := result.0;
    return result.1;
  };
  
  // Delete a task
  public func deleteTask(id: Nat): async Bool {
    func filterTasks(lst: List.List<Task>, acc: List.List<Task>, found: Bool): (List.List<Task>, Bool) {
      switch lst {
        case null { (List.reverse(acc), found) };
        case (?(head, tail)) {
          if (head.id == id) {
            filterTasks(tail, acc, true); 
          } else {
            filterTasks(tail, List.push(head, acc), found);
          };
        };
      };
    };
    let result = filterTasks(tasks, List.nil(), false);
    tasks := result.0;
    return result.1;
  };
}


