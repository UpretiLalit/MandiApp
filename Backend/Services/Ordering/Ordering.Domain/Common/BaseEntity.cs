namespace Ordering.Domain.Common;

/// <summary>
/// Base class for all entities in the domain model.
/// Provides common properties like Id, timestamps, and domain events support.
/// </summary>
public abstract class BaseEntity
{
    private List<IDomainEvent> _domainEvents = new();

    /// <summary>
    /// Unique identifier for the entity
    /// </summary>
    public Guid Id { get; protected set; }

    /// <summary>
    /// Timestamp when the entity was created
    /// </summary>
    public DateTime CreatedAt { get; protected set; }

    /// <summary>
    /// Timestamp when the entity was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; protected set; }

    /// <summary>
    /// Domain events raised by this entity
    /// </summary>
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    protected BaseEntity(Guid id)
    {
        Id = id;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Add a domain event to be dispatched later
    /// </summary>
    protected void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    /// <summary>
    /// Clear all domain events
    /// </summary>
    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    /// <summary>
    /// Mark entity as updated
    /// </summary>
    protected void MarkAsUpdated()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}
