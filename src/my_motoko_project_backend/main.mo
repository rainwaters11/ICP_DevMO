import List "mo:base/List";
import Time "mo:base/Time";

actor TodoList {

  type Task = {
    id : Nat;
    description : Text;
    completed : Bool;
    timestamp : Int;
  };

  var tasks : List.List<Task> = List.nil();
  var nextId : Nat = 0;

  public func addTask(description : Text) : async Nat {
    let task : Task = {
      id = nextId;
      description = description;
      completed = false;
      timestamp = Time.now();
    };
    tasks := List.push(task, tasks);
    nextId += 1;
    return task.id;
  };

  public query func getTasks() : async [Task] {
    return List.toArray(tasks);
  };

  public func completeTask(id: Nat): async Bool {
    // Recursive helper function
    func updateTasks(lst: List.List<Task>, acc: List.List<Task>, found: Bool): (List.List<Task>, Bool) {
      switch lst {
        case null {
          (List.reverse(acc), found);
        };
        case (?(head, tail)) {
          if (head.id == id) {
            let updatedTask: Task = {
              id = head.id;
              description = head.description;
              completed = true;
              timestamp = head.timestamp;
            };
            updateTasks(tail, List.push(updatedTask, acc), true);
          } else {
            updateTasks(tail, List.push(head, acc), found);
          }
        };
      }
    };

    let (updatedTasks, found) = updateTasks(tasks, List.nil(), false);
    tasks := updatedTasks;
    return found;
  };
};


