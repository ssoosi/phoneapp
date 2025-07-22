using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDevClient",
        policy => policy.WithOrigins("http://localhost:4200")  // Angular dev server origin
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});



// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddDbContext<ContactDbContext>(options =>
    options.UseSqlite("Data Source=contacts.db"));


var app = builder.Build();

// Use CORS
app.UseCors("AllowAngularDevClient");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/contacts", async (ContactDbContext db) => await db.Contacts.ToListAsync());


//var contacts = new List<Contact>();

//app.MapGet("/api/contacts", () => contacts);

app.MapGet("/api/contacts/{id}", async (int id, ContactDbContext db) =>
{
    var contact = await db.Contacts.FindAsync(id);
    return contact is not null ? Results.Ok(contact) : Results.NotFound();
});


app.MapPost("/api/contacts", async (Contact contact, ContactDbContext db) =>
{
    db.Contacts.Add(contact);
    await db.SaveChangesAsync();
    return Results.Created($"/api/contacts/{contact.Id}", contact);
});


app.MapPut("/api/contacts/{id}", async (int id, Contact updated, ContactDbContext db) =>
{
    var exists = await db.Contacts.AsNoTracking().AnyAsync(c => c.Id == id);
    if (!exists) return Results.NotFound();

    // Detach any tracked instance with the same ID
    var local = db.Contacts.Local.FirstOrDefault(c => c.Id == id);
    if (local is not null)
    {
        db.Entry(local).State = EntityState.Detached;
    }

    updated = updated with { Id = id };
    db.Contacts.Update(updated);
    await db.SaveChangesAsync();

    return Results.NoContent();
});



app.MapDelete("/api/contacts/{id}", async (int id, ContactDbContext db) =>
{
    var contact = await db.Contacts.FindAsync(id);
    if (contact is null) return Results.NotFound();

    db.Contacts.Remove(contact);
    await db.SaveChangesAsync();
    return Results.NoContent();
});


app.MapControllers();

app.Run();

public record Contact(int Id, string Name, string PhoneNumber, string? Email);


